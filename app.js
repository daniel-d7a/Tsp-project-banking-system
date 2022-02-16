const express = require("express");
const mongoose = require("mongoose");
const Customer = require("./models/customer");
const Transaction = require("./models/transaction");

const app = express();

const database =
	"mongodb+srv://eyad-alsherif:dodomax12345@tsf-project.xjlsh.mongodb.net/tsf-project?retryWrites=true&w=majority";

mongoose
	.connect(database, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => app.listen(5500))
	.catch((err) => console.log(err));

app.set("view engine", "ejs");
app.use(express.static("style"));
app.use(express.urlencoded({ extended: true }));

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	res.locals.path = req.path;
	next();
});

app.get("/home-page", (req, res) => {
	res.render("home-page");
});

app.get("/", (req, res) => {
	res.render("home-page");
});

app.get("/customers", (req, res) => {
	Customer.find()
		.then((result) => {
			res.render("customers", { result });
		})
		.catch((err) => {
			console.log(err);
			res.render("error");
		});
});

app.get("/transactions", (req, res) => {
	Transaction.find()
		.sort({ createdAt: -1 })
		.then((result) => {
			res.render("transactions", { result });
		})
		.catch((err) => {
			console.log(err);
			res.render("error");
		});
});

app.get("/single-customer/:id", (req, res) => {
	const id = req.params.id;
	Customer.findById(id)
		.then((singleCustomer) => {
			Customer.find({ _id: { $ne: id } })
				.then((allCustomers) => {
					res.render("single-customer", { singleCustomer, allCustomers });
				})
				.catch((error) => {
					console.log(err);
					res.render("error");
				});
		})
		.catch((err) => {
			console.log(err);
			res.render("error");
		});
});

app.post("/transactions", (req, res) => {
	const transaction = new Transaction(req.body);
	Customer.findByIdAndUpdate(
		{ _id: transaction.to_id },
		{ $inc: { amount: transaction.amount } }
	).then(() => {
		Customer.findByIdAndUpdate(
			{ _id: transaction.from_id },
			{ $inc: { amount: -transaction.amount } }
		).then(() => {
			Customer.find()
				.then((customers) => {
					customers.forEach((customer) => {
						if (transaction.to_id === customer._id) {
							console.log("to id is corrrect");
							transaction['to'] = customer.name.toString();
						}
						if (transaction.from_id === customer._id) {
							console.log("from id is corrrect");
							transaction["from"] = customer.name.toString();
						}
					});
				})
				.then(() => {
					transaction
						.save()
						.then(() => {
							res.redirect("/transactions");
						})
						.catch((err) => {
							console.log(err);
							res.render("error");
						});
				});
		});
	});
});
