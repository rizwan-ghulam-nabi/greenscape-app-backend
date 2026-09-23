// // app-backend/routes/products.js
// import express from "express";
// import Product from "../models/Product.js";

// const router = express.Router();

// // ==========================================
// // ✅ PUBLIC ROUTES (NO AUTH REQUIRED)
// // ==========================================

// // 1. GET ALL PRODUCTS (Storefront)
// router.get("/public/products", async (req, res) => {
//   try {
//     const { 
//       category, 
//       subCategory,
//       search, 
//       minPrice, 
//       maxPrice,
//       sort = "-createdAt",
//       limit = 20, 
//       page = 1 
//     } = req.query;

//     let filter = { isActive: true };

//     if (category && category !== "All") {
//       filter.category = category;
//     }

//     if (subCategory) {
//       filter.subCategory = subCategory;
//     }

//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = parseFloat(minPrice);
//       if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
//     }

//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { desc: { $regex: search, $options: "i" } }
//       ];
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const products = await Product.find(filter)
//       .sort(sort)
//       .limit(parseInt(limit))
//       .skip(skip);

//     const totalProducts = await Product.countDocuments(filter);

//     res.json({
//       success: true,
//       products,
//       totalProducts,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(totalProducts / parseInt(limit))
//     });
//   } catch (err) {
//     console.error("Error fetching public products:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ 2. GET FEATURED PRODUCTS (MUST BE BEFORE :id)
// router.get("/public/products/featured", async (req, res) => {
//   try {
//     const products = await Product.find({ 
//       isFeatured: true, 
//       isActive: true 
//     })
//     .sort("-createdAt")
//     .limit(8);

//     res.json({
//       success: true,
//       products
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ 3. GET BESTSELLER PRODUCTS (MUST BE BEFORE :id)
// router.get("/public/products/bestsellers", async (req, res) => {
//   try {
//     const products = await Product.find({ 
//       isBestSeller: true, 
//       isActive: true 
//     })
//     .sort("-numReviews")
//     .limit(10);

//     res.json({
//       success: true,
//       products
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ 4. SEARCH PRODUCTS (MUST BE BEFORE :id)
// router.get("/public/products/search/:term", async (req, res) => {
//   try {
//     const products = await Product.find({
//       $text: { $search: req.params.term },
//       isActive: true
//     }, { score: { $meta: 'textScore' } })
//     .sort({ score: { $meta: 'textScore' } });

//     res.json({
//       success: true,
//       products
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ 5. GET SINGLE PRODUCT BY SLUG (MUST BE BEFORE :id)
// router.get("/public/products/slug/:slug", async (req, res) => {
//   try {
//     const product = await Product.findOne({ 
//       slug: req.params.slug,
//       isActive: true 
//     });
    
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }
//     res.json({
//       success: true,
//       product
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ 6. GET SINGLE PRODUCT BY ID (LAST - catches everything else)
// router.get("/public/products/:id", async (req, res) => {
//   try {
//     // ✅ Check if ID is valid ObjectId
//     if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     const product = await Product.findOne({ 
//       _id: req.params.id,
//       isActive: true 
//     });
    
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }
//     res.json({
//       success: true,
//       product
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // ==========================================
// // ✅ EXPORT ROUTER
// // ==========================================
// export default router;















// app-backend/routes/products.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// ==========================================
// ✅ PUBLIC ROUTES (NO AUTH REQUIRED)
// ==========================================

// 1. GET ALL PRODUCTS (Storefront)
router.get("/public/products", async (req, res) => {
  try {
    const {
      category,
      subCategory,
      search,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      limit = 20,
      page = 1,
    } = req.query;

    let filter = { isActive: true };

    // ✅ CASE-INSENSITIVE CATEGORY MATCH
    if (category && category !== "All") {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    // ✅ CASE-INSENSITIVE SUBCATEGORY MATCH
    if (subCategory && subCategory !== "All") {
      filter.subCategory = { $regex: `^${subCategory}$`, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const totalProducts = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      totalProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching public products:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 2. GET FEATURED PRODUCTS
router.get("/public/products/featured", async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .sort("-createdAt")
      .limit(8);

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. GET BESTSELLER PRODUCTS
router.get("/public/products/bestsellers", async (req, res) => {
  try {
    const products = await Product.find({
      isBestSeller: true,
      isActive: true,
    })
      .sort("-numReviews")
      .limit(10);

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 4. SEARCH PRODUCTS
router.get("/public/products/search/:term", async (req, res) => {
  try {
    const products = await Product.find(
      {
        $text: { $search: req.params.term },
        isActive: true,
      },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 5. GET SINGLE PRODUCT BY SLUG
router.get("/public/products/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 6. GET SINGLE PRODUCT BY ID
router.get("/public/products/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;