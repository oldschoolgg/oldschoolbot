import { Middleware, MiddlewareStore } from 'klasa-dashboard-hooks';

import ApiRequest from '../lib/api/structures/ApiRequest';
import ApiResponse from '../lib/api/structures/ApiResponse';

export default class extends Middleware {
	public constructor(store: MiddlewareStore, file: string[], directory: string) {
		super(store, file, directory, { priority: 10 });
	}

	public run(request: ApiRequest, response: ApiResponse) {
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader(
			'Access-Control-Allow-Methods',
			'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT'
		);
		response.setHeader(
			'Access-Control-Allow-Headers',
			'Authorization, User-Agent, Content-Type'
		);
		response.setHeader('Content-Type', 'application/json; charset=utf-8');
		if (request.method === 'OPTIONS') response.json({ success: true });
	}
}
