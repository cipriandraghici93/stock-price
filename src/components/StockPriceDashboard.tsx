import React, {useEffect, useState} from "react";
import Chart from "./Chart";
import {ChartService} from "../services/chart.service";
import {StockCandle} from "../models/stock-candle.model";
import StockPriceToolbar from "./StockPriceToolbar";
import {Resolution} from "../enums/resolution.enum";
import {DateRange} from "../models/date-range.model";
import {Series} from "../models/series.model";
import moment from "moment";

const StockPriceDashboard: React.FC = (props) => {
    const [stockData, setStockData] = useState<StockCandle | null>(null);
    const [chartData, setChartData] = useState<Series[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState<string>();
    const [selectedResolution, setSelectedResolution] = useState<Resolution>(Resolution.M);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
        start: new Date(),
        end: new Date()
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setChartData([]);
    }, []);

    useEffect(() => {
        getDataAsync();
    }, [selectedSymbol, selectedResolution, selectedDateRange]);

    useEffect(() => {
        const chartService: ChartService = new ChartService();
        if(!stockData) { return; }

        if(stockData.s === "no_data") {
            setChartData([]);
            return;
        }

        const series = chartService.buildDataPoints(stockData, {size: 20, seriesName: selectedSymbol});
        setChartData([
            {
                name: selectedSymbol || "",
                values: series
            }
        ]);
        setError(null);
    }, [stockData]);

    const getDataAsync = async () => {
        if(!selectedSymbol) { return; }

        const chartService: ChartService = new ChartService();
        try {
            const data = await chartService.getData(selectedSymbol, selectedResolution || Resolution.M, "1572651390", "1575243390");
            // const data = await chartService.getData(selectedSymbol, selectedResolution || Resolution.D, moment(selectedDateRange.start).unix().toString(), moment(selectedDateRange.end).unix().toString());
            console.log(data);
            setStockData(data as StockCandle);
        } catch (err) {
            setError(err.message);
        }
    }

    const onSymbolChange = (value: string) => {
        setSelectedSymbol(value);
    }

    const onResolutionChange = (value: Resolution) => {
        setSelectedResolution(value);
    }

    const onDateRangeChange = (value: DateRange) => {
        setSelectedDateRange(value);
    }
    
    return (
        <div>
            <StockPriceToolbar handleSymbolChange={onSymbolChange} handleResolutionChange={onResolutionChange} handleDateRangeChange={onDateRangeChange} />
            { error }
            {
                !error &&
                <Chart data={chartData} />
            }
        </div>
    )
}

export default StockPriceDashboard;