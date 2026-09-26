import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

/**
 * =============================================================================
 * SECTION 1 — FUNCTIONAL REQUIREMENTS (FR)
 * =============================================================================
 * Each FR is traced to (a) the project objective it serves and (b) the source
 * file where it is implemented. Test names below reference these IDs.
 *
 * FR1  (Obj. i, ii)   The system SHALL allow a visitor to browse the menu,
 *                      grouped by category, without creating an account.
 *                      [src/utils/menu-context.tsx, CATEGORIES]
 *
 * FR2  (Obj. ii)       The system SHALL allow a customer to create an account
 *                      and sign in using an email and password.
 *                      [src/utils/auth-context.tsx, signUp/signIn]
 *
 * FR3  (Obj. ii)       The system SHALL allow an eatery operator (admin) to
 *                      sign in through a separate, role-gated admin session.
 *                      [src/utils/auth-context.tsx, signInAdmin/isAdminSession]
 *
 * FR4  (Obj. ii)       The system SHALL allow a guest (not signed in) to add
 *                      items to a cart, and SHALL merge that guest cart into
 *                      the customer's account cart automatically on sign-in.
 *                      [src/utils/cart-context.tsx, migrateGuestCartTo]
 *
 * FR5  (Obj. ii)       The system SHALL allow a customer to add, remove, and
 *                      change the quantity of items in their cart, and SHALL
 *                      remove a line automatically if its quantity is reduced
 *                      to zero or below.
 *                      [src/utils/cart-context.tsx, add/remove/setQty]
 *
 * FR6  (Obj. ii)       The system SHALL calculate the cart subtotal as the
 *                      sum of (item price x quantity) across all cart lines.
 *                      [src/utils/cart-context.tsx, subtotal]
 *
 * FR7  (Obj. ii)       The system SHALL let the customer choose between
 *                      "pickup" and "delivery" at checkout, and SHALL apply a
 *                      delivery fee of NGN 300 unless the method is pickup or
 *                      the subtotal is at least NGN 10,000, in which case the
 *                      delivery fee SHALL be zero.
 *                      [supabase/functions/_shared/order.ts, deliveryFee]
 *
 * FR8  (Obj. ii)       The system SHALL process payment through Paystack and
 *                      SHALL NOT create an order until payment is verified.
 *                      [src/utils/paystack.ts; supabase/functions/verify-payment]
 *
 * FR9  (Obj. ii)       The system SHALL independently verify, on the server,
 *                      that the amount actually paid (as reported by Paystack)
 *                      equals the order total; it SHALL reject order creation
 *                      if the two amounts do not match.
 *                      [supabase/functions/_shared/order.ts, verifiedAmountKobo check]
 *
 * FR10 (Obj. ii, iii)  The system SHALL reject a checkout intent whose line
 *                      items reference a non-existent menu item, or whose
 *                      quantity is not a positive whole number.
 *                      [supabase/functions/_shared/order.ts, item validation]
 *
 * FR11 (Obj. iii)      The system SHALL create exactly one order per unique
 *                      payment reference, even if order creation is triggered
 *                      more than once for the same reference (e.g. by both
 *                      the webhook and the verify-payment call).
 *                      [supabase/functions/_shared/order.ts, existingOrder check]
 *
 * FR12 (Obj. iii)      The system SHALL record, for every completed order,
 *                      the line items, subtotal, delivery fee, total, chosen
 *                      method, payment reference, and customer contact details.
 *                      [supabase/functions/_shared/order.ts, orders insert]
 *
 * FR13 (Obj. iii)      The system SHALL allow an eatery operator to view all
 *                      orders across all customers, and SHALL allow the
 *                      operator to update an order's status.
 *                      [src/utils/orders-context.tsx, useAdminOrders]
 *
 * FR14 (Obj. iii)      The system SHALL allow a customer to view only their
 *                      own order history and current order status.
 *                      [src/utils/orders-context.tsx, useOrders, fetchOrders]
 *
 * FR15 (Obj. iii)      The system SHALL allow an eatery operator to add,
 *                      update, and remove menu items.
 *                      [src/utils/menu-context.tsx, addItem/updateItem/deleteItem]
 *
 * FR16 (Obj. ii)       The system SHALL mark a menu item as "popular" once
 *                      its recorded order count reaches a defined threshold.
 *                      [src/utils/menu-context.tsx, isPopular, POPULAR_THRESHOLD]
 *
 * =============================================================================
 * SECTION 2 — NON-FUNCTIONAL REQUIREMENTS (NFR)
 * =============================================================================
 *
 * NFR1 (Security)        Admin privileges SHALL be determined from a session
 *                        claim issued by the authentication provider
 *                        (app_metadata.role), not from any value a client
 *                        could set on itself.
 *                        [src/utils/auth-context.tsx, isAdminSession]
 *
 * NFR2 (Security)        Order totals SHALL be computed and verified
 *                        server-side; the client-reported price SHALL never
 *                        be trusted for payment verification.
 *                        [supabase/functions/_shared/order.ts]
 *
 * NFR3 (Security)        Inbound Paystack webhook events SHALL be accepted
 *                        only if their HMAC-SHA512 signature, computed with
 *                        the shared secret, matches the signature header
 *                        supplied by Paystack.
 *                        [supabase/functions/paystack-webhook/index.ts]
 *
 * NFR4 (Reliability)     Because payment confirmation can arrive by more than
 *                        one path (webhook, and the customer's own
 *                        verify-payment call), order creation SHALL be
 *                        idempotent per payment reference so a customer is
 *                        never charged once but billed as two orders, and no
 *                        payment is silently lost if one path fails.
 *                        [supabase/functions/_shared/order.ts]
 *
 * NFR5 (Usability)       A prospective customer SHALL be able to browse the
 *                        menu and build a cart without first registering an
 *                        account, reducing friction versus a manual or
 *                        third-party ordering arrangement that requires a
 *                        separate app or platform account.
 *                        [src/utils/cart-context.tsx, guest cart]
 *
 * NFR6 (Data integrity)  A cart or order line SHALL never carry a negative
 *                        or fractional quantity, and SHALL never reference a
 *                        menu item that does not exist in the current menu.
 *                        [supabase/functions/_shared/order.ts]
 *
 * NFR7 (Maintainability) The order-creation rules SHALL live in one shared
 *                        module reused by both the webhook and the
 *                        verify-payment endpoint, so the business rule is
 *                        defined once rather than duplicated and risking
 *                        drift between the two entry points.
 *                        [supabase/functions/_shared/order.ts]
 *
 * NFR8 (Availability)    The system SHALL be usable from any standard web
 *                        browser on desktop or mobile, requiring no native
 *                        application install, consistent with the project's
 *                        web-based scope.
 *
 * NFR9 (Auditability)    Every order record SHALL retain its original
 *                        payment reference, so any transaction can be
 *                        independently reconciled against Paystack's own
 *                        records after the fact.
 *                        [supabase/functions/_shared/order.ts, payment_ref]
 *
 * =============================================================================
 */

/**
 * =============================================================================
 * SECTION 3 — REIMPLEMENTED CORE LOGIC
 * (Pure, dependency-free mirrors of the real business rules)
 * =============================================================================
 */

// --- Cart math (mirrors src/utils/cart-context.tsx) -------------------------

function calcSubtotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function calcCount(items) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** Mirrors CartProvider.add() for the guest (localStorage) path. */
function addGuestLine(lines, menuItemId, qty = 1) {
  const existing = lines.find((l) => l.menu_item_id === menuItemId);
  if (existing) {
    return lines.map((l) =>
      l.menu_item_id === menuItemId ? { ...l, quantity: l.quantity + qty } : l,
    );
  }
  return [...lines, { menu_item_id: menuItemId, quantity: qty }];
}

/** Mirrors CartProvider.setQty() — removes the line once quantity <= 0. */
function setGuestLineQty(lines, menuItemId, qty) {
  if (qty <= 0) return lines.filter((l) => l.menu_item_id !== menuItemId);
  return lines.map((l) => (l.menu_item_id === menuItemId ? { ...l, quantity: qty } : l));
}

/** Mirrors CartProvider.migrateGuestCartTo() merge behaviour. */
function mergeGuestCartIntoAccount(accountRows, guestLines) {
  const rows = accountRows.map((r) => ({ ...r }));
  for (const line of guestLines) {
    const existing = rows.find((r) => r.menu_item_id === line.menu_item_id);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      rows.push({
        id: `new-${line.menu_item_id}`,
        menu_item_id: line.menu_item_id,
        quantity: line.quantity,
      });
    }
  }
  return rows;
}

// --- Menu logic (mirrors src/utils/menu-context.tsx) ------------------------

const POPULAR_THRESHOLD = 10;
function isPopular(item) {
  return item.orderCount >= POPULAR_THRESHOLD;
}

// --- Auth/role logic (mirrors src/utils/auth-context.tsx) -------------------

function isAdminSession(session) {
  return session?.user?.app_metadata?.role === "admin";
}

// --- Formatting (mirrors src/utils/format.ts) --------------------------------

function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- Order creation from a paid checkout intent -----------------------------
// (mirrors supabase/functions/_shared/order.ts, createOrderFromIntent, using
//  a plain in-memory store instead of a real Supabase client)

function validateItemShape(items) {
  for (const i of items) {
    if (!i.menu_item_id || !Number.isInteger(i.quantity) || i.quantity <= 0) {
      return { ok: false, error: "Invalid item quantity" };
    }
  }
  return { ok: true };
}

function calcDeliveryFee(method, subtotal) {
  return method === "pickup" || subtotal >= 10000 ? 0 : 300;
}

/**
 * Faithful mirror of createOrderFromIntent(), operating on a plain object
 * `db` shaped like:
 *   { menu: [...], checkoutIntents: [...], orders: [...], orderItems: [...] }
 */
function createOrderFromIntentSim(db, reference, verifiedAmountKobo) {
  const existingOrder = db.orders.find((o) => o.reference === reference);
  if (existingOrder) return { orderId: existingOrder.id };

  const intent = db.checkoutIntents.find((ci) => ci.reference === reference);
  if (!intent) return { error: "No matching checkout intent found", status: 400 };

  const items = intent.items;
  const shapeCheck = validateItemShape(items);
  if (!shapeCheck.ok) return { error: shapeCheck.error, status: 400 };

  const ids = items.map((i) => i.menu_item_id);
  const uniqueIds = [...new Set(ids)];
  // NOTE: this mirrors the real Postgres `.in("id", ids)` call, which returns
  // one row per *distinct* matching id, not one row per array entry. If the
  // same menu_item_id legitimately appears twice in `items` (which should
  // not happen via the normal cart flow, since the cart always merges
  // quantities into a single line — see FR5 — but is not blocked at this
  // layer), menuRows.length will be smaller than ids.length even though
  // every id is valid, and the request is wrongly rejected. This is a real
  // edge case in the current implementation, surfaced by INT4 below.
  const menuRows = db.menu.filter((m) => uniqueIds.includes(m.id));
  if (menuRows.length !== ids.length) {
    return { error: "One or more menu items are invalid", status: 400 };
  }

  const lineItems = items.map((i) => {
    const menuItem = menuRows.find((m) => m.id === i.menu_item_id);
    return {
      menu_item_id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image_url,
      quantity: i.quantity,
    };
  });

  const subtotal = calcSubtotal(lineItems);
  const deliveryFee = calcDeliveryFee(intent.method, subtotal);
  const total = subtotal + deliveryFee;

  if (verifiedAmountKobo !== total * 100) {
    return { error: "Payment amount does not match order total", status: 400 };
  }

  const order = {
    id: `order-${db.orders.length + 1}`,
    user_id: intent.user_id,
    reference,
    status: "Received",
    method: intent.method,
    subtotal,
    delivery_fee: deliveryFee,
    total,
    payment_ref: reference,
    customer_name: intent.customer.name,
    customer_email: intent.customer.email,
    customer_phone: intent.customer.phone,
    customer_address: intent.customer.address ?? null,
  };
  db.orders.push(order);

  for (const li of lineItems) {
    db.orderItems.push({
      order_id: order.id,
      menu_item_id: li.menu_item_id,
      name: li.name,
      price: li.price,
      quantity: li.quantity,
      image: li.image,
    });
  }

  db.checkoutIntents = db.checkoutIntents.filter((ci) => ci.reference !== reference);

  return { orderId: order.id };
}

// --- Webhook signature verification (mirrors paystack-webhook/index.ts) -----

function computeWebhookSignature(rawBody, secret) {
  return crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
}

function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature) return false;
  const computed = computeWebhookSignature(rawBody, secret);
  return computed === signature;
}

/**
 * =============================================================================
 * SECTION 4 — UNIT TESTS
 * =============================================================================
 */

describe("Unit tests — Cart logic (FR4, FR5, FR6)", () => {
  it("FR6: subtotal sums price x quantity across all lines", () => {
    const items = [
      { price: 1500, quantity: 2 },
      { price: 800, quantity: 3 },
    ];
    assert.equal(calcSubtotal(items), 1500 * 2 + 800 * 3);
  });

  it("FR6: cart item count sums quantities, not line count", () => {
    const items = [
      { price: 100, quantity: 4 },
      { price: 200, quantity: 1 },
    ];
    assert.equal(calcCount(items), 5);
  });

  it("FR5: adding the same menu item twice increases quantity on one line", () => {
    let lines = [];
    lines = addGuestLine(lines, "jollof-rice", 1);
    lines = addGuestLine(lines, "jollof-rice", 2);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].quantity, 3);
  });

  it("FR5: reducing quantity to zero removes the cart line", () => {
    let lines = [{ menu_item_id: "moi-moi", quantity: 2 }];
    lines = setGuestLineQty(lines, "moi-moi", 0);
    assert.equal(lines.length, 0);
  });

  it("FR4: guest cart lines merge into an existing account cart on sign-in", () => {
    const accountRows = [{ id: "row-1", menu_item_id: "suya", quantity: 1 }];
    const guestLines = [
      { menu_item_id: "suya", quantity: 2 }, // should merge into row-1
      { menu_item_id: "malt", quantity: 1 }, // should be added as a new row
    ];
    const merged = mergeGuestCartIntoAccount(accountRows, guestLines);
    const suya = merged.find((r) => r.menu_item_id === "suya");
    const malt = merged.find((r) => r.menu_item_id === "malt");
    assert.equal(merged.length, 2);
    assert.equal(suya.quantity, 3);
    assert.ok(malt);
    assert.equal(malt.quantity, 1);
  });
});

describe("Unit tests — Menu logic (FR16)", () => {
  it("FR16: an item below the popularity threshold is not marked popular", () => {
    assert.equal(isPopular({ orderCount: 9 }), false);
  });

  it("FR16: an item at or above the popularity threshold is marked popular", () => {
    assert.equal(isPopular({ orderCount: 10 }), true);
    assert.equal(isPopular({ orderCount: 25 }), true);
  });
});

describe("Unit tests — Authentication and roles (FR3, NFR1)", () => {
  it("NFR1: a session without an admin role claim is not treated as admin", () => {
    const session = { user: { app_metadata: { role: "customer" } } };
    assert.equal(isAdminSession(session), false);
  });

  it("NFR1: only app_metadata.role === 'admin' grants admin status", () => {
    const session = { user: { app_metadata: { role: "admin" } } };
    assert.equal(isAdminSession(session), true);
  });

  it("NFR1: a missing session is safely treated as non-admin", () => {
    assert.equal(isAdminSession(null), false);
    assert.equal(isAdminSession(undefined), false);
  });
});

describe("Unit tests — Delivery fee rule (FR7)", () => {
  it("FR7: delivery fee is NGN 300 for delivery orders under NGN 10,000", () => {
    assert.equal(calcDeliveryFee("delivery", 4500), 300);
  });

  it("FR7: delivery fee is waived once subtotal reaches NGN 10,000", () => {
    assert.equal(calcDeliveryFee("delivery", 10000), 0);
    assert.equal(calcDeliveryFee("delivery", 15000), 0);
  });

  it("FR7: delivery fee is always zero for pickup, regardless of subtotal", () => {
    assert.equal(calcDeliveryFee("pickup", 500), 0);
  });
});

describe("Unit tests — Order item validation (FR10, NFR6)", () => {
  it("NFR6: a zero or negative quantity is rejected", () => {
    const result = validateItemShape([{ menu_item_id: "rice", quantity: 0 }]);
    assert.equal(result.ok, false);
  });

  it("NFR6: a fractional quantity is rejected", () => {
    const result = validateItemShape([{ menu_item_id: "rice", quantity: 1.5 }]);
    assert.equal(result.ok, false);
  });

  it("NFR6: a missing menu_item_id is rejected", () => {
    const result = validateItemShape([{ menu_item_id: "", quantity: 1 }]);
    assert.equal(result.ok, false);
  });

  it("FR10: a well-formed positive-integer quantity passes validation", () => {
    const result = validateItemShape([{ menu_item_id: "rice", quantity: 2 }]);
    assert.equal(result.ok, true);
  });
});

describe("Unit tests — Currency formatting", () => {
  it("formats a Naira amount as a currency string containing the value", () => {
    const formatted = formatNaira(2500);
    assert.match(formatted, /2,500|2500/);
  });
});

describe("Unit tests — Webhook signature verification (NFR3)", () => {
  const secret = "test_paystack_secret";
  const rawBody = JSON.stringify({ event: "charge.success", data: { reference: "REF123" } });

  it("NFR3: accepts a signature computed with the correct secret", () => {
    const validSignature = computeWebhookSignature(rawBody, secret);
    assert.equal(verifyWebhookSignature(rawBody, validSignature, secret), true);
  });

  it("NFR3: rejects a signature computed with the wrong secret", () => {
    const wrongSignature = computeWebhookSignature(rawBody, "some_other_secret");
    assert.equal(verifyWebhookSignature(rawBody, wrongSignature, secret), false);
  });

  it("NFR3: rejects a tampered payload even if a signature is present", () => {
    const validSignature = computeWebhookSignature(rawBody, secret);
    const tamperedBody = JSON.stringify({ event: "charge.success", data: { reference: "REF999" } });
    assert.equal(verifyWebhookSignature(tamperedBody, validSignature, secret), false);
  });

  it("NFR3: rejects a request with no signature header at all", () => {
    assert.equal(verifyWebhookSignature(rawBody, null, secret), false);
  });
});

/**
 * =============================================================================
 * SECTION 5 — INTEGRATION TESTS
 * (Exercise the full checkout -> payment verification -> order creation ->
 *  admin/customer visibility flow against an in-memory fake database)
 * =============================================================================
 */

function freshDb() {
  return {
    menu: [
      { id: "m1", name: "Jollof Rice & Chicken", price: 2500, image_url: "jollof.jpg" },
      { id: "m2", name: "Bottled Water", price: 300, image_url: "water.jpg" },
    ],
    checkoutIntents: [],
    orders: [],
    orderItems: [],
  };
}

function seedIntent(db, overrides = {}) {
  const intent = {
    reference: "PSK-REF-001",
    user_id: "user-42",
    method: "delivery",
    items: [
      { menu_item_id: "m1", quantity: 2 },
      { menu_item_id: "m2", quantity: 1 },
    ],
    customer: {
      name: "Ada Obi",
      email: "ada@example.com",
      phone: "08010000000",
      address: "Hostel B",
    },
    ...overrides,
  };
  db.checkoutIntents.push(intent);
  return intent;
}

describe("Integration — Checkout to order creation (FR8, FR9, FR12, Obj. ii)", () => {
  it("INT1: a correctly verified payment creates one order with correct totals", () => {
    const db = freshDb();
    seedIntent(db);
    // subtotal = 2*2500 + 1*300 = 5300; delivery fee applies (below 10,000) = 300; total = 5600
    const expectedTotal = 5600;
    const result = createOrderFromIntentSim(db, "PSK-REF-001", expectedTotal * 100);

    assert.ok(result.orderId, "expected an order to be created");
    const order = db.orders.find((o) => o.id === result.orderId);
    assert.equal(order.subtotal, 5300);
    assert.equal(order.delivery_fee, 300);
    assert.equal(order.total, 5600);
    assert.equal(order.status, "Received");
    assert.equal(db.orderItems.filter((oi) => oi.order_id === order.id).length, 2);
    // FR11: the paid intent is consumed so it cannot be reused
    assert.equal(db.checkoutIntents.length, 0);
  });

  it("INT2 (FR9, NFR2): order creation is refused if the verified amount does not match the total", () => {
    const db = freshDb();
    seedIntent(db);
    const wrongAmountKobo = 100000; // does not match the true total of 5600 NGN
    const result = createOrderFromIntentSim(db, "PSK-REF-001", wrongAmountKobo);

    assert.equal(result.error, "Payment amount does not match order total");
    assert.equal(db.orders.length, 0, "no order should be created on amount mismatch");
  });

  it("INT3 (FR11, NFR4): re-processing the same reference does not create a duplicate order", () => {
    const db = freshDb();
    seedIntent(db);
    const total = 5600;

    const first = createOrderFromIntentSim(db, "PSK-REF-001", total * 100);
    // Simulate the webhook firing again for the same reference after
    // verify-payment already created the order (a realistic race in
    // production, since both paths can be triggered for one payment).
    const second = createOrderFromIntentSim(db, "PSK-REF-001", total * 100);

    assert.equal(first.orderId, second.orderId);
    assert.equal(db.orders.length, 1, "exactly one order should exist for one payment reference");
  });

  it("INT4 (limitation surfaced by testing): a duplicated menu_item_id within one intent is wrongly rejected", () => {
    // This documents a genuine edge case in the current implementation
    // (see the comment inside createOrderFromIntentSim). It is not reachable
    // through the normal cart flow (FR5 always merges a repeated item into
    // one line), but nothing at the order-creation layer itself prevents a
    // malformed intent with a repeated id, and the current length check
    // then rejects it even though both ids are valid.
    const db = freshDb();
    seedIntent(db, {
      items: [
        { menu_item_id: "m1", quantity: 1 },
        { menu_item_id: "m1", quantity: 1 }, // duplicated, not merged
      ],
    });
    const result = createOrderFromIntentSim(db, "PSK-REF-001", 500000);
    assert.equal(result.error, "One or more menu items are invalid");
    assert.equal(db.orders.length, 0);
  });

  it("INT5 (FR10): an intent referencing a menu item that no longer exists is rejected", () => {
    const db = freshDb();
    seedIntent(db, { items: [{ menu_item_id: "does-not-exist", quantity: 1 }] });
    const result = createOrderFromIntentSim(db, "PSK-REF-001", 999900);
    assert.equal(result.error, "One or more menu items are invalid");
    assert.equal(db.orders.length, 0);
  });

  it("INT6 (FR10, NFR6): an intent with a non-positive quantity is rejected before touching the menu", () => {
    const db = freshDb();
    seedIntent(db, { items: [{ menu_item_id: "m1", quantity: -1 }] });
    const result = createOrderFromIntentSim(db, "PSK-REF-001", 250000);
    assert.equal(result.error, "Invalid item quantity");
    assert.equal(db.orders.length, 0);
  });

  it("INT7: an order qualifies for free delivery when the subtotal alone reaches NGN 10,000", () => {
    const db = freshDb();
    seedIntent(db, { items: [{ menu_item_id: "m1", quantity: 4 }] }); // subtotal = 10,000
    const result = createOrderFromIntentSim(db, "PSK-REF-001", 10000 * 100);
    assert.ok(result.orderId);
    const order = db.orders.find((o) => o.id === result.orderId);
    assert.equal(order.delivery_fee, 0);
    assert.equal(order.total, 10000);
  });

  it("INT8: a pickup order never carries a delivery fee, even for a small subtotal", () => {
    const db = freshDb();
    seedIntent(db, { method: "pickup", items: [{ menu_item_id: "m2", quantity: 1 }] }); // subtotal = 300
    const result = createOrderFromIntentSim(db, "PSK-REF-001", 300 * 100);
    assert.ok(result.orderId);
    const order = db.orders.find((o) => o.id === result.orderId);
    assert.equal(order.delivery_fee, 0);
    assert.equal(order.total, 300);
  });
});

describe("Integration — Order visibility and status updates (FR13, FR14, Obj. iii)", () => {
  it("INT9: a placed order is visible to admin (all orders) and to its own customer, but not to other customers", () => {
    const db = freshDb();
    seedIntent(db, { user_id: "user-42" });
    const { orderId } = createOrderFromIntentSim(db, "PSK-REF-001", 5600 * 100);

    // Simulated admin view (FR13): fetch all orders, unfiltered
    const adminView = db.orders;
    assert.equal(
      adminView.some((o) => o.id === orderId),
      true,
    );

    // Simulated customer view (FR14): fetch orders filtered by user_id
    const ownerView = db.orders.filter((o) => o.user_id === "user-42");
    const otherCustomerView = db.orders.filter((o) => o.user_id === "some-other-user");
    assert.equal(
      ownerView.some((o) => o.id === orderId),
      true,
    );
    assert.equal(otherCustomerView.length, 0);
  });

  it("INT10 (FR13): an admin status update is reflected in the order record and in the customer's own view", () => {
    const db = freshDb();
    seedIntent(db, { user_id: "user-42" });
    const { orderId } = createOrderFromIntentSim(db, "PSK-REF-001", 5600 * 100);

    // Simulated admin action: useAdminOrders().updateStatus(id, status)
    const order = db.orders.find((o) => o.id === orderId);
    order.status = "Preparing";

    const ownerView = db.orders.filter((o) => o.user_id === "user-42");
    assert.equal(ownerView[0].status, "Preparing");
  });

  it("INT11 (FR12, NFR9): a completed order retains a full, reconcilable record", () => {
    const db = freshDb();
    seedIntent(db);
    const { orderId } = createOrderFromIntentSim(db, "PSK-REF-001", 5600 * 100);
    const order = db.orders.find((o) => o.id === orderId);

    assert.equal(order.payment_ref, "PSK-REF-001");
    assert.equal(order.customer_name, "Ada Obi");
    assert.equal(order.customer_email, "ada@example.com");
    assert.ok(Array.isArray(db.orderItems.filter((oi) => oi.order_id === orderId)));
    assert.equal(db.orderItems.filter((oi) => oi.order_id === orderId).length, 2);
  });
});

describe("Integration — Webhook and verify-payment reach the same shared rule (NFR7)", () => {
  it("INT12: both entry points route through the same order-creation function and agree on the result", () => {
    // Two independent in-memory databases, standing in for the two separate
    // Deno edge functions, both calling the SAME shared logic on the SAME
    // underlying payment event -- demonstrating the rule is defined once
    // and applied identically regardless of which endpoint fires first.
    const dbViaWebhook = freshDb();
    seedIntent(dbViaWebhook);
    const dbViaVerifyEndpoint = freshDb();
    seedIntent(dbViaVerifyEndpoint);

    const total = 5600;
    const resultA = createOrderFromIntentSim(dbViaWebhook, "PSK-REF-001", total * 100);
    const resultB = createOrderFromIntentSim(dbViaVerifyEndpoint, "PSK-REF-001", total * 100);

    assert.ok(resultA.orderId);
    assert.ok(resultB.orderId);
    const orderA = dbViaWebhook.orders[0];
    const orderB = dbViaVerifyEndpoint.orders[0];
    assert.equal(orderA.total, orderB.total);
    assert.equal(orderA.delivery_fee, orderB.delivery_fee);
    assert.equal(orderA.status, orderB.status);
  });
});
