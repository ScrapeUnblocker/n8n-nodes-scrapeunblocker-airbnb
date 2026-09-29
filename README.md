# n8n-nodes-scrapeunblocker-airbnb

This is an n8n community node. It lets you search **Airbnb stays** in any city in your n8n workflows and get them as JSON: title, price for the stay, rating, review count, room type, badges, coordinates and a direct listing URL. Filter by dates, guests, room type and price.

The node runs the [Airbnb Scraper](https://apify.com/scrapeunblocker/airbnb-scraper) Actor by ScrapeUnblocker on the [Apify](https://apify.com) platform with **your own Apify account**, waits for the run to finish and returns every scraped record as an n8n item.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Credentials](#credentials)
[Operations](#operations)
[Output](#output)
[Example workflow](#example-workflow)
[Pricing](#pricing)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The npm package name is `n8n-nodes-scrapeunblocker-airbnb`.

## Credentials

The node authenticates with an **Apify API token**. Every run starts on the Apify account that owns the token and is billed to that account (see [Pricing](#pricing)).

### 1. Create an Apify account (skip if you already have one)

1. Go to [console.apify.com/sign-up](https://console.apify.com/sign-up) and sign up with email, Google or GitHub.
2. Confirm your email address if Apify asks you to.

The free Apify plan needs no credit card and includes a monthly usage credit, which is enough to try the node. Current plan limits are listed on [apify.com/pricing](https://apify.com/pricing).

### 2. Get your API token

1. Open [Apify Console](https://console.apify.com) and go to **Settings** → **API & Integrations**, or open [console.apify.com/settings/integrations](https://console.apify.com/settings/integrations) directly.
2. Find the **Personal API tokens** section.
3. Either use the existing token (the one marked *Default API token created on sign up*): click the eye icon to reveal it or the copy icon to copy it.
4. Or create a dedicated token for n8n (recommended, so you can revoke it without affecting anything else):
   1. Click **+ Add new token** (the button may read **Create new token**).
   2. In the **Create a new personal API token** dialog, enter a **Description** such as `n8n`.
   3. Optionally switch on **Set expiration date** and pick a date.
   4. Leave **Limit token permissions** switched off. A token with limited permissions may not be allowed to run this Actor or read its results.
   5. Click **Create** and copy the new token.

The token starts with `apify_api_`. Treat it like a password: anyone who has it can run Actors on your account. You can revoke or rotate it on the same page at any time.

> Working in an Apify **organization**? Switch to the organization in Apify Console first and copy a token from its **API & Integrations** page, so runs are billed to the organization.

### 3. Add the credential in n8n

1. Add the **Airbnb Scraper** node to a workflow and open it.
2. In **Credential to connect with**, choose **Create new credential**. (You can also create an **Apify API** credential from the n8n credentials list.)
3. Paste the token into **API Key** and click **Save**. n8n checks the token right away; an invalid token shows *Authorization failed - please check your credentials*.

Already have an **Apify API** credential in n8n (for example from the official Apify node)? This node uses the same credential type, so you can simply select it.


## Operations

Pick a **Resource** and an **Operation**. Each n8n input item starts one Apify run. List fields accept several values separated by commas or new lines, or an array returned by an expression.

| Resource | Operation | Fields | Returns |
|---|---|---|---|
| **Listing** | Search | **Location** (required) - City to search, e.g. 'Austin, TX' or 'Paris, France'<br>**Max Results** - How many stays to collect across pages (1-720, about 18 per page) | One item per listing |

### Options

| Option | Description |
|---|---|
| **Adults** | Number of adult guests |
| **Check-In Date** | Check-in date as YYYY-MM-DD. Set it together with Check-Out Date to get prices for those dates. |
| **Check-Out Date** | Check-out date as YYYY-MM-DD |
| **Max Price** | Highest nightly price to include. Needs check-in and check-out dates. |
| **Min Price** | Lowest nightly price to include. Needs check-in and check-out dates. |
| **Proxy Country** | Exit-IP country (ISO-2, e.g. GB). Leave blank for a US exit, so prices are in USD. |
| **Room Type** | Only stays of this type |
| **Timeout (Seconds)** | Maximum run time of the Apify run. `0` keeps the Actor default. A run that times out fails the node. |

### How a run works

1. The node starts the Actor on your Apify account with the fields you set.
2. It waits for the run to finish.
3. It returns every record from the run's dataset as a separate n8n item.

The run is also visible in Apify Console under **Runs**. If a run fails or times out, the node error links to the run log and tells you whether any results were saved before it stopped.

Stopping the n8n execution only stops the node from waiting: the Apify run keeps going and its results are still charged. To stop it, abort the run in Apify Console under **Runs**, and use **Timeout (Seconds)** to cap long runs up front.

### Use as an AI Agent tool

The node can be attached to an n8n **AI Agent** as a tool, so the agent can call it on its own.

## Output

- One item per listing, with listing ID and URL, title and subtitle, room type, price (number, text, what it covers such as 'for 3 nights', and the original price when discounted), rating, review count, badges such as Guest favorite, latitude / longitude and an image.


Fields of a returned item: `id`, `name`, `roomType`, `subtitle`, `price`, `priceText`, `priceQualifier`, `priceLabel`, `rating`, `reviewCount`, `badges`, `latitude`, `longitude`, `image`, `url`.

Example item (shortened):

```json
{
  "id": "23860926",
  "name": "Colorful East Austin Bungalow | Patio | Walkable",
  "roomType": "Home in Austin",
  "subtitle": "Screened porch and fenced yard in East Austin, with a fire pit and an EV charger",
  "price": 725,
  "priceText": "$725",
  "priceQualifier": "for 5 nights",
  "priceLabel": "$725 for 5 nights",
  "rating": 4.95,
  "reviewCount": 720,
  "badges": [
    "Guest favorite"
  ],
  "latitude": 30.2563,
  "longitude": -97.7,
  "image": "https://a0.muscache.com/im/pictures/miso/Hosting-23860926/original/0ca54888-c...",
  "...": "..."
}
```

## Example workflow

To try the node in a minute, copy the workflow below, paste it into the n8n editor (Ctrl+V / Cmd+V), open the **Airbnb Scraper** node, select your **Apify API** credential and click **Execute workflow**.

```json
{
  "nodes": [
    {
      "parameters": {},
      "name": "When clicking 'Execute workflow'",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        0,
        0
      ]
    },
    {
      "parameters": {
        "resource": "listing",
        "operation": "search",
        "location": "Austin, TX",
        "maxResults": 5,
        "options": {}
      },
      "name": "Airbnb Scraper",
      "type": "n8n-nodes-scrapeunblocker-airbnb.airbnbScraper",
      "typeVersion": 1,
      "position": [
        220,
        0
      ]
    }
  ],
  "connections": {
    "When clicking 'Execute workflow'": {
      "main": [
        [
          {
            "node": "Airbnb Scraper",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Pricing

The node itself is free. The Actor is paid per result on Apify: **$1.50 per 1,000 listings** plus a tiny start fee per run ($0.00005), charged to the Apify account of your token. Every item the node returns counts as one result. The current price is always shown on the [Actor page](https://apify.com/scrapeunblocker/airbnb-scraper), and your spending is visible in Apify Console.

## Compatibility

Tested with n8n 2.40 (self-hosted).

## Resources

- [Airbnb Scraper Actor on Apify](https://apify.com/scrapeunblocker/airbnb-scraper)
- [Apify API tokens documentation](https://docs.apify.com/platform/integrations/api#api-token)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ScrapeUnblocker](https://www.scrapeunblocker.com/?utm_source=n8n&utm_medium=integration&utm_campaign=n8n-airbnb-node) - the anti-bot scraping API behind the Actor

## Version history

- 0.1.0: Initial release
- 0.1.1: First release published from GitHub Actions with an npm provenance statement
