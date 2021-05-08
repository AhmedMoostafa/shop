const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { match } = require("assert");
const ITEMS_PER_PAGE = 1;
const goTo = async (req, res, next, url, path, title) => {
  const page = parseInt(req.query.page) || 1;
  const numberOfProducts = await Product.countDocuments({});
  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then((products) => {
      res.render(url, {
        prods: products,
        pageTitle: title,
        path: path,
        numberOfProducts,
        hasnext: ITEMS_PER_PAGE * page < numberOfProducts,
        hasPrevious: page > 1,
        currentPage: page,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(numberOfProducts / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getProducts = (req, res, next) => {
  goTo(req, res, next, "shop/product-list", "/products", "All Products");
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = async (req, res, next) => {
  goTo(req, res, next, "shop/index", "/", "Shop");
};

exports.getCart = async (req, res, next) => {
  try {
    await req.user.populate("cart.productId").execPopulate();
    const products = req.user.cart;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

/* exports.getCheckout = async (req, res, next) => {
  await req.user.populate("cart.productId").execPopulate();
  const products = req.user.cart;
  let totalPrice = 0;
  for (let i = 0; i < products.length; i++) {
    totalPrice += products[i].productId.price * products[i].quantity;
  }
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "checkout",
    products: products,
    totalSum: totalPrice,
  });
}; */

exports.postOrder = async (req, res, next) => {
  try {
    const user = req.user;
    const products = user.cart.map((i) => {
      return { quantity: i.quantity, product: i.productId };
    });
    const order = new Order({
      products: products,
      userId: req.user._id,
    });

    await user.clearCart();
    await order.save();
    res.redirect("/orders");
  } catch (error) {
    console.log(error);
  }
};
exports.getOrders = async (req, res, next) => {
  const orders = await Order.find({ userId: req.session.user._id }).populate(
    "products.product",
    "title -_id"
  );
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
    orders: orders,
  });
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);
  if (order.userId.toString() !== req.user._id.toString()) {
    return next(new Error("unothorized"));
  }

  const invoiceName = `invoice-${orderId}.pdf`;
  const filePath = path.join("data", "invoices", invoiceName);
  const pdfDoc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="' + invoiceName + '"'
  );

  pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.pipe(res);
  pdfDoc.fontSize(26).text("invoice", {
    underline: true,
  });
  pdfDoc.text("---------------------------");
  let orders = await Order.findById(orderId).populate(
    "products.product",
    "title price -_id"
  );
  orders = orders.products;
  let totalPrice = 0;
  for (let i = 0; i < orders.length; i++) {
    totalPrice += orders[i].product.price * orders[i].quantity;
    pdfDoc
      .fontSize(14)
      .text(
        `${orders[i].product.title} : ${orders[i].quantity} × ${orders[i].product.price}`
      );
  }
  pdfDoc.text(`--------`);

  pdfDoc.fontSize(20).text(`Total price : ${totalPrice}`);
  pdfDoc.end();

  //preloading
  /*   fs.readFile(filePath, (err, data) => {
    if (err) {
      return next(err);
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );

    res.send(data);
  }); */

  //steaming
  /*  const file = fs.createReadStream(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );
  file.pipe(res); 
  
  */
};
