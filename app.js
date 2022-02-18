const express = require("express");
const mongoose = require("mongoose");
const Customer = require("./models/customer");
const Transaction = require("./models/transaction");
const path = require('path')
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "style"));
liveReloadServer.server.once("connection", () => {
	setTimeout(() => {
		liveReloadServer.refresh("/");
	}, 100);
});


const app = express();

const database =
"mongodb+srv://eyad-alsherif:dodomax12345@tsf-project.xjlsh.mongodb.net/tsf-project?retryWrites=true&w=majority";

const port = process.env.PORT || 5000

mongoose
.connect(database, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		app.listen(port)
		console.log(port);
	})
.catch((err) => console.log(err));


app.set("view engine", "ejs");
app.use(connectLivereload());
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

app.get("/new-customer", (req, res) => {
	res.render('new-customer')
})

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
					Transaction.find({
						$or: [
							{ to_id: id },
							{from_id:id}
						]
					}).then((customerTransactions) => {
						res.render("single-customer", { singleCustomer, allCustomers, customerTransactions });
					})
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
						// console.log(customer);
						if (transaction.to_id.toString() === customer._id.toString()) {
							// console.log("to id is corrrect");
							transaction['to'] = customer.name.toString();
						}
						if (transaction.from_id.toString() === customer._id.toString()) {
							// console.log("from id is corrrect");
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


app.post("/customers", (req, res) => {
	const newCustomer = new Customer(req.body);
	newCustomer.save()
		.then(() => {
			res.redirect("customers");
	});
})