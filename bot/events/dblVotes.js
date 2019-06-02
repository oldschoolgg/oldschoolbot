const { Event } = require("klasa");
const DBL = require("dblapi.js");

module.exports = class extends Event {
  constructor(...args) {
    super(...args, { once: true, event: "klasaReady" });
    this.enabled = this.client.production;
  }

  run() {
    this.client.dbl = new DBL(this.client.dbl.token, {
      webhookPort: 8000,
      webhookAuth: this.client.dbl.auth
    });

    this.client.dbl.on("error", err => {
      console.error(`DBL API Error: ${err}`);
    });

    this.client.dbl.webhook.on("ready", hook => {
      console.log(
        `Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`
      );
    });

    this.client.dbl.webhook.on("vote", vote =>
      this.client.tasks.get("vote").run(vote)
    );
  }
};
