import {HttpService} from "./http.service";
import {ChartServiceContract} from "../contracts/chart-service.contract";
import {StockCandle} from "../models/stock-candle.model";
import {DataPoint} from "../models/data-point.model";
import {SecurityService} from "./security.service";
import {Resolution} from "../enums/resolution.enum";
import {StockSymbol} from "../models/stock-symbol.model";

export class ChartService implements ChartServiceContract {
    public async getSymbols(): Promise<StockSymbol[] | null> {
        const httpService: HttpService = HttpService.getInstance();

        try {
            const response = await httpService.get<string[]>(`${httpService.baseUrl}/stock/symbol?exchange=US&token=${sessionStorage.accessToken}`);

            if (response.status !== 200) {
                httpService.handleRejection(response);
                return null;
            }

            return response.parsedBody as any[] || [];
        } catch (err) {
            httpService.handleRejection(err);
            return null;
        }
    }

    public async getData(symbol: string, resolution: Resolution, from: string, to: string): Promise<StockCandle | undefined> {
        const httpService: HttpService = HttpService.getInstance();
        const securityService: SecurityService = new SecurityService();

        const token = securityService.getToken();

        try {
            const response = await httpService.get<StockCandle>(`${httpService.baseUrl}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${token}`);

            if (response.status !== 200) {
                httpService.handleRejection(response);
            }

            return response.parsedBody as StockCandle;
        } catch (err) {
            httpService.handleRejection(err);
        }
    }

    public buildDataPoints(model: StockCandle, customProps?: object) {
        const dataPoints: DataPoint[] = [...
            model.c.reduce((acc, curr, idx) => {
                acc.push({
                    x: new Date(model.t[idx]),
                    y: curr,
                    color: "red",
                    ...customProps
                })
                return acc;
            }, [] as DataPoint[])
        ];

        return dataPoints;
    }
}