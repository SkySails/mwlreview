console.log(
    "%cVälkommen till preflighten av detta mwl-api!",
    "color: lightblue; font-size: 2rem; font-family: Arial, Helvetica, sans-serif; font-weight: 700;"
);
console.log(
    "%cOBS! Inloggning sker på följande sätt:",
    "color: white; font-size: 1rem; font-family: Arial, Helvetica, sans-serif; background: #db1d16; padding: 10px 20px; border-radius: 5px; "
);

console.log(
    '%cwindow.login = {user: "ANVÄNDARNAMN", password: "LÖSENORD"}',
    "color: white;  font-family: Arial, Helvetica, sans-serif;  padding: 10px 20px "
);

document.querySelector(".cta-button").addEventListener("click", () => {
    document.querySelector(".welcome-content").style.opacity = "0";
    document.querySelector(".welcome-content").style.display = "none";
    document.querySelector(".form-container").classList.add("form-pop");
    document.querySelector(".form-placebo").style.opacity = "1";
});

document.querySelector("#close-button").addEventListener("click", () => {
    document.querySelector(".form-placebo").style.opacity = "0";
    document.querySelector(".form-container").classList.remove("form-pop");
    document.querySelector(".welcome-content").style.display = "flex";
    document.querySelector(".welcome-content").style.opacity = "1";
});

document.querySelector("#login").addEventListener("click", e => {
    e.preventDefault();
    var user = document.querySelector("input[name='user']").value;
    var pswd = document.querySelector("input[name='pswd']").value;
    window.login = { user: user, password: pswd };
    loader();
    getPlaneStats(true);
});

document
    .querySelector("input[name='pswd']")
    .addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("login").click();
        }
    });

function loader() {
    document.querySelector("#login").innerHTML = `
		<div class="lds-ellipsis">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	`;
}

async function callAPI(params, loginObject) {
    var loginObject = loginObject || window.login;

    var initRequest = {
        mwl_u: loginObject.user,
        mwl_p: loginObject.password,
        returnType: "JSON",
        app_token: "uuJH6tY3122t541!!MAHA!",
        language: "se"
    };

    return await fetch(
        "https://cors-anywhere.herokuapp.com/api.myweblog.se:443/api_mobile.php?version=2.0.3",
        {
            body: new URLSearchParams({ ...initRequest, ...params }),
            method: "POST"
        }
    )
        .then(response => {
            return response.json();
        })
        .then(res => {
            return res;
        })
        .catch(err => {
            console.error(err);
        });
}

function getTransactions(options) {
    var request = {
        qtype: "GetTransactions",
        limit: typeof options === "undefined" ? 100 : options.limit,
        ...options
    };

    return callAPI(request).then(res => {
        console.log({
            Balance: res.result.Balance,
            Transactions: res.result.Transaction
        });
    });
}

function getFlights(options) {
    var request = {
        qtype: "GetFlightLog",
        limit: typeof options === "undefined" ? 100 : options.limit,
        myflights: typeof options === "undefined" ? 1 : options.myflight,
        ...options
    };

    callAPI(request).then(res => {
        console.log(res.result.FlightLog);
    });
}

async function getPlaneStats(render) {
    var request1 = {
        qtype: "GetFlightLog",
        limit: 200,
        myflights: 1
    };

    var request2 = {
        qtype: "GetTransactions",
        limit: 200
    };

    var [transactions, balance] = await callAPI(request2).then(res => {
        return [res.result.Transaction, res.result.Balance];
    });

    var planeStats = {};

    // Money spent

    for (item of transactions) {
        if (item.comment.match(/SE-\w\w\w/)) {
            var regnr = item.comment.match(/SE-\w\w\w/)[0];
            if (planeStats[regnr]) {
                planeStats[regnr].money += parseInt(item.belopp) * -1;
            } else {
                planeStats[regnr] = {
                    money: parseInt(item.belopp) * -1
                };
            }
        }
    }

    var flightLog = await callAPI(request1).then(res => {
        return res.result.FlightLog;
    });

    // console.log(flightLog);

    // Flights done, airborne time

    for (item of flightLog) {
        if (planeStats[item.regnr].airborne) {
            planeStats[item.regnr].airborne += parseFloat(item.airborne_total);
            planeStats[item.regnr].totalFlights++;
        } else {
            planeStats[item.regnr] = {
                ...planeStats[item.regnr],
                airborne: parseFloat(item.airborne_total),
                totalFlights: 1
            };
        }
    }

    for (item in planeStats) {
        if (planeStats[item].airborne) {
            planeStats[item].airborne = planeStats[item].airborne.toFixed(3);
        }
    }

    // Avarage tachometer

    for (item of flightLog) {
        if (item.tach_total) {
            if (planeStats[item.regnr].avg_tach) {
                planeStats[item.regnr].avg_tach.push(
                    parseFloat(item.tach_total) /
                        parseFloat(item.airborne_total)
                );
            } else {
                planeStats[item.regnr].avg_tach = [
                    parseFloat(item.tach_total) /
                        parseFloat(item.airborne_total)
                ];
            }
        }
    }

    // console.log(planeStats);

    // Calculate avg Tachometer

    for (item in planeStats) {
        if (planeStats[item].avg_tach) {
            var total = 0;
            for (entry of planeStats[item].avg_tach) {
                total += Number(entry);
            }
            var avg = total / planeStats[item].avg_tach.length;
            planeStats[item].avg_tach = avg.toFixed(3);
        }
    }

    // Money per Hour

    for (item of flightLog) {
        if (planeStats[item.regnr].airborne && planeStats[item.regnr].money) {
            planeStats[item.regnr].money_ratio = Math.round(
                parseInt(planeStats[item.regnr].money) /
                    Math.floor(parseFloat(planeStats[item.regnr].airborne))
            );
        } else {
            continue;
        }
    }
    console.log(planeStats);

    if (render) {
        renderCards(planeStats);
    }
}

function renderCards(list) {
    for (reg in list) {
        var card = document.createElement("DIV");
        card.className = "card";

        var heading = document.createElement("H1");
        heading.innerHTML = reg;
        card.appendChild(heading);

        var entryContainer = document.createElement("DIV");

        for (property in list[reg]) {
            var cardEntry = document.createElement("DIV");
            cardEntry.className = "card-entry";

            var titleSpan = document.createElement("SPAN");
            titleSpan.innerHTML = property + ":";
            var valueSpan = document.createElement("SPAN");
            valueSpan.innerHTML = list[reg][property];

            cardEntry.appendChild(titleSpan);
            cardEntry.appendChild(valueSpan);

            entryContainer.appendChild(cardEntry);
        }

        card.appendChild(entryContainer);
        document.querySelector(".cards-container").appendChild(card);
        document.querySelector(".form-container").style.display = "none";
        document.querySelector(".welcome-container").style.display = "none";
        document.querySelector(".cards-container").style.display = "flex";
    }
}
