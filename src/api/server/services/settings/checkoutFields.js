'use strict';

const mongo = require('../../lib/mongo');
const parse = require('../../lib/parse');

class CheckoutFieldsService {
	constructor() {}

	getCheckoutFields() {
		return mongo.db
			.collection('checkoutFields')
			.find()
			.toArray()
			.then(fields =>
				fields.map(field => {
					delete field._id;
					return field;
				})
			);
	}

	getCheckoutField(name) {
		return mongo.db
			.collection('checkoutFields')
			.findOne({ name: name })
			.then(field => {
				return this.changeProperties(field);
			});
	}

	updateCheckoutField(name, data) {
		const field = this.getValidDocumentForUpdate(data);
		return mongo.db
			.collection('checkoutFields')
			.updateOne(
				{ name: name },
				{
					$set: field
				},
				{ upsert: true }
			)
			.then(res => this.getCheckoutField(name));
	}

	getValidDocumentForUpdate(data) {
		if (Object.keys(data).length === 0) {
			return new Error('Required fields are missing');
		}

		let field = {};

		if (data.status !== undefined) {
			field.status = parse.getString(data.status);
		}

		if (data.label !== undefined) {
			field.label = parse.getString(data.label);
		}

		if (data.placeholder !== undefined) {
			field.placeholder = parse.getString(data.placeholder);
		}

		return field;
	}

	changeProperties(field) {
		if (field) {
			delete field._id;
			delete field.name;
		} else {
			return {
				status: 'required',
				label: '',
				placeholder: ''
			};
		}

		return field;
	}
}

module.exports = new CheckoutFieldsService();
