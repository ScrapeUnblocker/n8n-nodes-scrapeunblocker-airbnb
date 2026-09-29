import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import type { OptionField } from './GenericFunctions';
import { applyOptions, requireString, runActorAndGetItems } from './GenericFunctions';

// ScrapeUnblocker's public "Airbnb Scraper" Actor: https://apify.com/scrapeunblocker/airbnb-scraper
const ACTOR_ID = 'UOejU9mDAro2WjjeH';
const INTEGRATION_APP_ID = 'scrapeunblocker-airbnb-scraper';

// Node option name -> Actor input key.
const OPTION_FIELDS: Record<string, OptionField> = {
	checkin: {
		key: 'checkin',
	},
	checkout: {
		key: 'checkout',
	},
	adults: {
		key: 'adults',
	},
	roomType: {
		key: 'room_type',
	},
	minPrice: {
		key: 'min_price',
	},
	maxPrice: {
		key: 'max_price',
	},
	proxyCountry: {
		key: 'proxy_country',
		kind: 'upper',
	},
};

function buildActorInput(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	options: IDataObject,
	itemIndex: number,
): IDataObject {
	const input: IDataObject = {};

	switch (`${resource}:${operation}`) {
		case 'listing:search': {
			input.location = requireString.call(this, 'location', 'Location', itemIndex);
			input.max_results = this.getNodeParameter('maxResults', itemIndex);
			break;
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`The operation "${operation}" is not supported for resource "${resource}"`,
				{ itemIndex },
			);
	}

	applyOptions(input, options, OPTION_FIELDS);
	return input;
}

export class AirbnbScraper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Airbnb Scraper',
		name: 'airbnbScraper',
		icon: {
			light: 'file:airbnbScraper.png',
			dark: 'file:airbnbScraper.dark.png',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Search Airbnb stays by city, dates and guests with the ScrapeUnblocker Actor on Apify',
		defaults: {
			name: 'Airbnb Scraper',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Listing',
						value: 'listing',
					},
				],
				default: 'listing',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['listing'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search Airbnb stays in a city',
						action: 'Search listings',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Austin, TX',
				description: "City to search, e.g. 'Austin, TX' or 'Paris, France'",
				displayOptions: {
					show: {
						resource: ['listing'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 720,
				},
				default: 96,
				description: 'How many stays to collect across pages (1-720, about 18 per page)',
				displayOptions: {
					show: {
						resource: ['listing'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Adults',
						name: 'adults',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 2,
						description: 'Number of adult guests',
					},
					{
						displayName: 'Check-In Date',
						name: 'checkin',
						type: 'string',
						default: '',
						placeholder: '2026-11-12',
						description:
							'Check-in date as YYYY-MM-DD. Set it together with Check-Out Date to get prices for those dates.',
					},
					{
						displayName: 'Check-Out Date',
						name: 'checkout',
						type: 'string',
						default: '',
						placeholder: '2026-11-15',
						description: 'Check-out date as YYYY-MM-DD',
					},
					{
						displayName: 'Max Price',
						name: 'maxPrice',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 500,
						description: 'Highest nightly price to include. Needs check-in and check-out dates.',
					},
					{
						displayName: 'Min Price',
						name: 'minPrice',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description: 'Lowest nightly price to include. Needs check-in and check-out dates.',
					},
					{
						displayName: 'Proxy Country',
						name: 'proxyCountry',
						type: 'string',
						default: '',
						placeholder: 'US',
						description:
							'Exit-IP country (ISO-2, e.g. GB). Leave blank for a US exit, so prices are in USD.',
					},
					{
						displayName: 'Room Type',
						name: 'roomType',
						type: 'options',
						options: [
							{
								name: 'Any',
								value: '',
							},
							{
								name: 'Entire Home/apt',
								value: 'entire_home',
							},
							{
								name: 'Hotel Room',
								value: 'hotel_room',
							},
							{
								name: 'Private Room',
								value: 'private_room',
							},
							{
								name: 'Shared Room',
								value: 'shared_room',
							},
						],
						default: '',
						description: 'Only stays of this type',
					},
					{
						displayName: 'Timeout (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description:
							'Maximum run time of the Apify Actor run. 0 keeps the Actor default. A run that times out fails the node.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const { timeout, ...actorOptions } = options;

				const input = buildActorInput.call(this, resource, operation, actorOptions, i);
				const { items: results } = await runActorAndGetItems.call(this, {
					actorId: ACTOR_ID,
					integrationAppId: INTEGRATION_APP_ID,
					input,
					itemIndex: i,
					timeoutSecs: (timeout as number) || undefined,
				});

				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				// Both constructors return an error of their own class unchanged.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
