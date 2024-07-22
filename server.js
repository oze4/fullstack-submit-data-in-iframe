const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
process.env.PORT = process.env.PORT || 5500;

app.use(express.json()); // Don't need body-parser in newer versions of express
app.use("/", express.static(path.join(__dirname, "/public")));

app.post("/subscribe", (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send({ success: false, message: "missing email" });
    }

    const dataPath = path.resolve(__dirname, "subscribers.json");

    fs.readFile(dataPath, (err, data) => {
        if (err) {
            return res.status(500).send({ success: false, message: "Internal server error" });
        }

        const subscribers = JSON.parse(data);
		const alreadySubscribed = subscribers.some((sub) => sub.email === email);
		
        if (alreadySubscribed) {
            return res.status(400).send({ success: false, message: "Email already exists" });
        }

        subscribers.push({ email });

        fs.writeFile(dataPath, JSON.stringify(subscribers, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
            res.status(200).send({ success: true, message: "Success!" });
        });
    });
});

app.listen(process.env.PORT, () => {
    console.log(`app listening on port ${process.env.PORT}`);
});
