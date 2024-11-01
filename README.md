## Hyper Microservice API
This is a simple example of a microservice architecture written in NodeJs and Typescript.

### Introduction
The idea of this infrastructure is having 3 separate services with compute resources independent from each other,
this will allow horizontal scaling to be easily implemented:
1. **API Gateway Service** - this is usually an external provider but in this example we are simulating the function of an
external service that will proxy and handle routes for our ms services to communicate and be publicly exposed with just
using a single domain of access ie: http://localhost:3000/api
2. **Auth Service** - this is the authentication service for users and admin
3. **Product Service** - handles business logic for products and catalogs

As seen in figure 1 below, these are services with separate concerns and can be deployed into separate servers or repo,
simulated via containerization by docker:
![Hyper Microservice.concept.png](assets/images/Hyper%20Microservice.concept.png)

### Requirements
The following are the required techstack to run and execute the API.
* Docker - 27.^
* Docker compose - 2.29.^
* Node 18.20.^
* npm 10.7
* AWS Account && Created AWS SQS 
* [Generated](https://verifone.cloud/docs/2checkout/Documentation/07Commerce/2Checkout-ConvertPlus/How-to-generate-a-JSON-Web-Token-JWT) JWT Token 

### Installation
1. Clone the repo
2. Go to the application root
3. Create the `.env` files for each of the services by copying each of the services env.example.txt
   1. `cp env.example.txt .env`
   2. `cp api-gateway/env.example.txt api-gateway/.env`
   3. `cp services/auth/env.example.txt services/auth/.env`
   4. `cp services/product/env.example.txt services/product/.env`
4. Make sure you to fill up important .env variables in "each" of the .env files:
```dotenv
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
SQS_QUEUE_URL=
JWT_SECRET=[Generated JWT Token]
```
5. In your terminal execute:
   1. `npm install`
   2. `docker-compose up --build -d`
6. Execute migrations for each services:
   1. `docker-compose exec auth-service npx prisma migrate dev`
   2. `docker-compose exec product-service npx prisma migrate dev`
3. Execute the seeders for each services:
   1. `docker-compose exec auth-service npm run seed`
   2. `docker-compose exec product-service npm run seed`

### Testing
This can be tested either via cli or postman, for simplicity we are testing it via postman:
1. Add the following variables:
- `base_url`: [http://localhost:3000](http://localhost:3000)
- `auth_token`: (leave this empty for now)
2. Create a user
   * Method: POST
         URL: [http://localhost:3000/auth/register](http://localhost:3000/auth/register)
         Body: raw JSON
```
{
   "username": "testuser",
   "email": "testuser@example.com",
   "password": "password123"
}
```
3. Login:
   * Method: POST
         URL: {base_url}/auth/login
         Body (raw JSON):
```json 
 { 
     "email": "testuser@example.com",
     "password": "password123"
 }
```
4. Create a new product:
   * Method: POST 
        URL: {base_url}/products 
   * Headers:
        Key: Authorization 
        Value: Bearer {auth_token} 
        Body (raw JSON):
```json
{
  "name": "Test Product",
  "description": "This is a test product",
  "price": 19.99,
  "sku": "TEST001",
  "inventory": 100,
  "categoryId": 1
}
```

Thank you! 