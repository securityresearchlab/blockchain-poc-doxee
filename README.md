# Doxee
Web application to upload files inside blockchain using Hyperledger Fabric v2

## Backend
Generate openapi .json file based on env you need<br/>
```
npm run generate-openapi:dev
npm run generate-openapi:test
npm run generate-openapi:prod
```
Start backend
```
npm run start:dev
npm run start:test
npm run start:prod
```

## Frontend
Generate client services based on openapi .json file
```
npm run openapi-gen
```
Start frontend
```
// dev env
npm run dev

// prod env
npm run build
npm run start
```