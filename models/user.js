var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
   	email: {
	      type: DataTypes.STRING,
	      allowNull: false,
	      unique: true,
	      validate: {
				isEmail: true
			}
		},
		salt: {
      	type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
	   	type: DataTypes.VIRTUAL,
	      allowNull: false,
	      validate: {
				len: [7, 100]
	      },
	      set: function(value) {
				// generate random string (salt)
				var salt = bcrypt.genSaltSync(10);
				// attach salt to password and encrypt
				var hashedPassword = bcrypt.hashSync(value, salt);
				// store these values to DB
				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
	      }
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (user && bcrypt.compareSync(body.password, user.get('password_hash'))) {
							resolve(user);
						} else {
							return reject();
						}
					}, function(err) {
						return reject();
					});
				});
			}
		},
		instanceMethods: {
			// define what info is safe for public exposure
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			// token to associate users's todos and account
			generateToken: function(type) {
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
					var token = jwt.sign({
						token: encryptedData
					}, 'qwerty7890');
					return token;
				} catch(err) {
					console.error(err);
					return undefined;
				}
			}
		}
	});
	return user;
};
