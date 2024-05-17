const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi');
const mongoose = require('mongoose');
const Product = require('./product');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/your_database');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const productSchema = Joi.object({
  productName: Joi.string().required(),
  productDescription: Joi.string().required(),
  responsiblePerson: Joi.string().required(),
  password: Joi.string().required(),
  manager: Joi.string().required(),
  description: Joi.string().required()
});

app.post('/products', (req, res) => {
  const { productName, productDescription, responsiblePerson, password, manager, description } = req.body;

  const validationResult = productSchema.validate({ productName, productDescription, responsiblePerson, password, manager, description });

  if (validationResult.error) {
      return res.status(400).json({ message: validationResult.error.details[0].message });
  }

  const newProduct = new Product({
      productName,
      productDescription,
      responsiblePerson,
      password,
      manager,
      description
  });

  newProduct.save()
      .then(product => {
          res.status(201).json(product);
      })
      .catch(err => {
          res.status(500).json({ error: err.message });
      });
});

app.get('/products', (req, res) => {
    Product.find({}, '-password')
        .sort({ createdAt: -1 })
        .then(products => {
            res.status(200).json(products);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.get('/products/:productId', (req, res) => {
    const productId = req.params.productId;

    Product.findById(productId, '-password')
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.put('/products/:productId', (req, res) => {
    const productId = req.params.productId;
    const { productName, productDescription, responsiblePerson, status, password, manager, description } = req.body;

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.password !== password) {
                return res.status(401).json({ message: 'Password does not match' });
            }

            product.productName = productName;
            product.productDescription = productDescription;
            product.responsiblePerson = responsiblePerson;
            product.status = status;
            product.manager = manager;
            product.description = description;

            if (status === 'SOLD_OUT') {
                product.updatedAt = new Date();
            }

            return product.save();
        })
        .then(updatedProduct => {
            res.status(200).json(updatedProduct);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.delete('/products/:productId', (req, res) => {
    const productId = req.params.productId;
    const { password } = req.body;

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.password !== password) {
                return res.status(401).json({ message: 'Password does not match' });
            }

            return Product.deleteOne({ _id: productId });
        })
        .then(() => {
            res.status(200).json({ message: 'Product deleted successfully' });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: '상품 정보가 올바르지 않습니다.' });
    } else if (err.message === 'Product not found') {
        return res.status(404).json({ message: '상품이 존재하지 않습니다.' });
    } else if (err.message === 'Product already exists') {
        return res.status(400).json({ message: '이미 등록된 상품입니다.' });
    } else {
        console.error(err);
        return res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
