// Server-Sent Events broadcast bus for real-time admin notifications
class SSEBus {
  constructor() {
    this.clients = new Set();
  }
  add(controller) {
    this.clients.add(controller);
    return () => this.clients.delete(controller);
  }
  broadcast(eventName, data) {
    const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    for (const c of this.clients) {
      try { c.enqueue(encoder.encode(payload)); } catch {}
    }
  }
}

if (!global.__sseBus) global.__sseBus = new SSEBus();
export const sseBus = global.__sseBus;
