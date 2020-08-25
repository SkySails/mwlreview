const mwl_u = "ENTER_MWL_UNAME",
    mwl_p = "ENTER_MWL_PASSWORD";

const mwlFetcher = (req) => {
    return fetch("https://api.myweblog.se/api_mobile.php?version=2.0.3", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            app_token: "uuJH6tY3122t541!!MAHA!",
            mwl_u,
            mwl_p,
            returnType: "JSON",
            language: "se",
            ...req,
        }),
    });
};

function getMWLData(req, res, next) {
    // Next.js API Routes likes when one returns a Promise, as it provides a definite way of concluding the request when done.
    return new Promise((resolve, reject) => {
        // Parse request body for a query (What data to get from the api) and user info (required to make the request)
        const { query, mwl_u, mwl_p } = req.body;

        // Choose queryType (qtype) for the MWL-API using a switch on the query variable
        switch (query) {
            case "Logs": {
                // If the "Logs" query is specified, run the mwlFetcher (to get the default, mandatory fetch configuration) and extend..
                // ..its parameters with a qtype and parameters required for that qtype.
                mwlFetcher({ qtype: "GetFlightLogReversed", myflights: 1 })
                    .then((res) => res.json())
                    .then((logs) => {
                        res.status(200).send(logs);
                        resolve(logs); // Notify the Promise of the fact that it has come to a resolution.
                    });
                break;
            }
            default: {
                console.log("Default was hit"); // If no query is specified, we should really be returning an error.
            }
        }
    });
}

export default getMWLData;
