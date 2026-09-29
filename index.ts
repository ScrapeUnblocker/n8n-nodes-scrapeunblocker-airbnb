import { AirbnbScraper } from './nodes/AirbnbScraper/AirbnbScraper.node';
import { ApifyApi } from './credentials/ApifyApi.credentials';

export const nodeTypes = [AirbnbScraper];

export const credentialTypes = [ApifyApi];
