import { RandomOHLC } from "./random_ohlc";

async function main() {
    try {
        const generator = new RandomOHLC({
            daysNeeded: 5,
            startPrice: 100,
            volatility: 0.2,
            drift: 0.05
        });

        const data = generator.generateOhlcData();

        console.log("Daily data:");
        console.log(data["1D"].head(5).toString());

        console.log("\nHourly data:");
        console.log(data["1H"].head(5).toString());
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

// Similar to Python's if __name__ == "__main__":
if (require.main === module) {
    main().catch(error => {
        console.error("Unhandled error:", error);
        process.exit(1);
    });
} 