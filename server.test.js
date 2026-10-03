import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createServer } from "node:http";
import { createApp } from "./server.js";
import { getDemoTimes, isDemoDateAvailable } from "./booking-demo.js";

const server = createServer(createApp());
let origin;

before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("static site hosting", () => {
  it("serves the demo booking page and its browser logic", async () => {
    const response = await fetch(`${origin}/booking-demo.html`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Demo scheduler/);
    assert.match(html, /no personal details are collected/i);
    const script = await fetch(`${origin}/booking-demo.js`);
    assert.equal(script.status, 200);
    assert.match(await script.text(), /getDemoTimes/);
  });

  it("keeps booking pages same-origin only", async () => {
    const response = await fetch(`${origin}/booking-demo.html`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-security-policy"), /frame-src 'self'/);
  });

  it("keeps private project and dependency files unavailable", async () => {
    for (const pathname of ["/package.json", "/server.js", "/server.test.js", "/node_modules/"]) {
      const response = await fetch(`${origin}${pathname}`);
      assert.equal(response.status, 404, `${pathname} should not be public`);
    }
  });

  it("serves legacy booking routes as redirects to the demo scheduler", async () => {
    for (const route of ["booking-acuity.html", "booking-service.html", "booking-time.html", "booking-details.html", "booking-confirmation.html"]) {
      const response = await fetch(`${origin}/${route}`, { redirect: "manual" });
      assert.equal(response.status, 200);
      assert.match(await response.text(), /booking-demo\.html/);
    }
  });
});

describe("demo calendar", () => {
  const today = new Date(2026, 0, 1);

  it("offers example openings Tuesday through Saturday from today onward", () => {
    assert.equal(isDemoDateAvailable(new Date(2026, 0, 2), today), true);
    assert.equal(isDemoDateAvailable(new Date(2026, 0, 4), today), false);
    assert.equal(isDemoDateAvailable(new Date(2026, 0, 5), today), false);
    assert.equal(isDemoDateAvailable(new Date(2025, 11, 31), today), false);
  });

  it("returns only example time choices for available dates", () => {
    assert.deepEqual(getDemoTimes(new Date(2026, 0, 2), today), ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"]);
    assert.deepEqual(getDemoTimes(new Date(2026, 0, 4), today), []);
  });
});
