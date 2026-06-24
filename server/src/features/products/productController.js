import Product from "../products/Product.js";
import mongoose from "mongoose";

// ✅ Reusable helper — builds filter from uploadId query param
const buildMatchFilter = (uploadId) => {
  if (uploadId && mongoose.Types.ObjectId.isValid(uploadId)) {
    return { uploadId: new mongoose.Types.ObjectId(uploadId) };
  }
  return {}; // empty = all products
};

// GET /api/products/top-products?uploadId=xxx
export const getTopProducts = async (req, res) => {
  try {
    const match = buildMatchFilter(req.query.uploadId);

    const products = await Product.find(match)
      .sort({ soldUnits: -1 })
      .limit(10);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/categories?uploadId=xxx
export const getCategoryStats = async (req, res) => {
  try {
    const match = buildMatchFilter(req.query.uploadId);

    const stats = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalSold: { $sum: "$soldUnits" },
          totalRevenue: { $sum: { $multiply: ["$price", "$soldUnits"] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/regions?uploadId=xxx
export const getRegionRevenue = async (req, res) => {
  try {
    const match = buildMatchFilter(req.query.uploadId);

    const stats = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$region",
          revenue: { $sum: { $multiply: ["$price", "$soldUnits"] } },
          soldUnits: { $sum: "$soldUnits" },
          totalStock: { $sum: "$stock" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/dashboard/:uploadId
export const getDashboardStats = async (req, res) => {
  try {
    const uploadId =
      req.params.uploadId ||
      req.query.uploadId;

    const match =
      buildMatchFilter(uploadId);

    const stats =
      await Product.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalProducts: {
              $sum: 1,
            },
            totalRevenue: {
              $sum: {
                $multiply: [
                  "$price",
                  "$soldUnits",
                ],
              },
            },
            totalStock: {
              $sum: "$stock",
            },
            totalSoldUnits: {
              $sum: "$soldUnits",
            },
            avgRating: {
              $avg: "$rating",
            },
          },
        },
      ]);

    if (!stats.length) {
      return res.status(200).json({
        totalProducts: 0,
        totalRevenue: 0,
        totalStock: 0,
        totalSoldUnits: 0,
        avgRating: 0,
      });
    }

    const { _id, ...result } =
      stats[0];

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getRatingDistribution = async (req, res) => {
  try {
    const uploadId =
      req.query.uploadId;

    const match =
      buildMatchFilter(uploadId);

    const ratings =
      await Product.aggregate([
        { $match: match },
        {
          $bucket: {
            groupBy: "$rating",
            boundaries: [0, 1, 2, 3, 4, 5],
            default: "Other",
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]);

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getCategoryDistribution =
  async (req, res) => {
    try {
      const match =
        buildMatchFilter(
          req.query.uploadId
        );

      const data =
        await Product.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$category",
              count: {
                $sum: 1,
              },
            },
          },
        ]);

      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };


  export const getPriceDistribution =
  async (req, res) => {
    try {
      const match =
        buildMatchFilter(
          req.query.uploadId
        );

      const data =
        await Product.aggregate([
          { $match: match },
          {
            $bucket: {
              groupBy: "$price",
              boundaries: [
                0,
                500,
                1000,
                2000,
                5000,
                10000,
              ],
              default: "10000+",
              output: {
                count: {
                  $sum: 1,
                },
              },
            },
          },
        ]);

      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};