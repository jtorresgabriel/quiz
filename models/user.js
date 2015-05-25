//Modelo de User con validaci´on y encriptaci´on de passwords
var crypto = require('crypto');
var key = process.env.PASSWORD_ENCRYPTION_KEY;

//Definicion del modelo de Comment con validacion
module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define(
		'User',
		{	
			username: {
				type: DataTypes.STRING,
				unique: true,
				validate: { 
					notEmpty:{msg:"--> Falta nombre de usuario"},
					
					//--> devuelve mensaje de error si username ya existe
					isUnique: function(value, next){
						var self = this;
						User
						.find({
							where: {username : value}
						}).then(function(user){
							if(user && self.id !== user.id){
								return next('username ya utilizado');
							}
							return next();
						}).catch(function(err) {return next(err);});
						}
					}
				},
			
			password:{
				type: DataTypes.STRING,
				validate: {
					notEmpty:{msg:"--> Falta password"}
				},
				set: function (password){
					try{var encripted = crypto
								.createHmac('sha1', key)
									.update(password)
									.digest('hex');
						}catch(e){console.log(e);}
						console.log("PAsword : " + password);
					
					console.log("ENcripted: " + encripted);
					//var encripted = crypto
					//				.createHmac('sha1', key)
					//				.update(password)
					//				.digest('hex');
						//Evita passwords vac´ios
						if (password === ''){encripted = '';}
						this.setDataValue('password',encripted);
				}
			},
			
			isAdmin:{
				type: DataTypes.BOOLEAN,
				defaultValue: false
			}
		},
		{
			instanceMethods:{
				verifyPassword: function(password){
						try{var encripted = crypto
								.createHmac('sha1', key)
									.update(password)
									.digest('hex');
						}catch(e){console.log(e);}
						console.log("Password : " + password);
					
					console.log("Encripted: " + encripted);
					return encripted === this.password;
				}
			}
		}
	);
return User;
}