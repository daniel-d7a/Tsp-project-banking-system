const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
	from: {
		type: String,
		required: true,
	},
	to: {
		type: String,
		// required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	from_id: {
	},
	to_id: {
	}
}, {timestamps: true});

const Transaction = mongoose.model("transaction", transactionSchema);
module.exports = Transaction;
