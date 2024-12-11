const http = require("http");
const fs = require("fs");
const url = require("url");

const { MongoClient } = require("mongodb");
const mongoUrl = "mongodb+srv://username:username@cluster0.areej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(mongoUrl);
const port = process.env.PORT || 3000;
http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);

    if (parsed.pathname == "/") {
        res.writeHead(200, { "Content-type": "text/html" });
        fs.readFile("form.html", (err, txt) => {
            res.write(txt);
            res.end();
        });
    } else if (parsed.pathname == "/process") {
        res.writeHead(200, { "Content-type": "text/html" });

        const input = parsed.query.input;
        const type = parsed.query.type;

        try {
            await client.connect();
            const database = client.db("Stock");
            const collection = database.collection("PublicCompanies");

            if (type == "stock") {
                const items = await collection.find({ "ticker": input }).toArray();
                console.log("Applicable stocks:");
                res.write("Applicable stocks:<br/>");
                res.write("<ul>");
                for (const item of items) {
                    console.log(item["name"], item["ticker"], item["price"]);
                    res.write(`<li>${item["name"]} ${item["ticker"]} ${item["price"]}</li>`);
                }
                res.write("</ul>");
            } else { // type == "company"
                const items = await collection.find({ "name": input }).toArray();
                console.log("Applicable stocks:");
                res.write("Applicable stocks:<br/>");
                res.write("<ul>");
                for (const item of items) {
                    console.log(item["name"], item["ticker"], item["price"]);
                    res.write(`<li>${item["name"]} ${item["ticker"]} ${item["price"]}</li>`);
                }
                res.write("</ul>");
            }
        } finally {
            await client.close();
        }

        res.end();
    } else {
        res.writeHead(200, { "Content-type": "text/html" });
        res.write("Unknown page request");

        res.end();
    }
}).listen(port);
