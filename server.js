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

	addEmailToSubscribers(path.resolve(__dirname, "subscribers.json"), email)
		.then(({status, message}) => {
			res.status(status).send({ success: true, message });
		})
		.catch(({ status, message }) => {
			res.status(status).send({ success: false, message });
		});
});

app.listen(process.env.PORT, () => {
	console.log(`app listening on port ${process.env.PORT}`);
});

/**
 * HELPER FUNCTIONS
 */

function addEmailToSubscribers(pathToJsonFile, emailToadd) {
	return new Promise((resolve, reject) => {
		fs.readFile(pathToJsonFile, (err, data) => {
			if (err) {
				return reject({ status: 500, message: "Internal server error"});
			}
	
			const subscribers = JSON.parse(data);
	
			if (subscribers.some((sub) => sub.email === emailToadd)) {
				return reject({ status: 400, message: "Email already exists"});
			}
	
			subscribers.push({ email: emailToadd });
	
			fs.writeFile(pathToJsonFile, JSON.stringify(subscribers, null, 2), (err) => {
				if (err) {
					return reject({ status: 500, message: "Internal server error"});
				}
				resolve({ status: 200, message: "Success!"});
			});
		});
	});
}