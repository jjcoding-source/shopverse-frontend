class APIFeatures {
  constructor(query, queryString) {
    this.query       = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.search) {
      this.query = this.query.find({
        $or: [
          { name:        { $regex: this.queryString.search, $options: "i" } },
          { description: { $regex: this.queryString.search, $options: "i" } },
          { brand:       { $regex: this.queryString.search, $options: "i" } },
        ],
      });
    }
    return this;
  }

  filter() {
    const queryObj  = { ...this.queryString };
    const excluded  = ["search", "sort", "page", "limit", "fields"];
    excluded.forEach((f) => delete queryObj[f]);

    // Category filter
    if (queryObj.category) {
      this.query = this.query.find({ category: queryObj.category });
      delete queryObj.category;
    }

    // Price range
    if (queryObj.minPrice || queryObj.maxPrice) {
      const priceFilter = {};
      if (queryObj.minPrice) priceFilter.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) priceFilter.$lte = Number(queryObj.maxPrice);
      this.query = this.query.find({ price: priceFilter });
      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    // Rating filter
    if (queryObj.rating) {
      this.query = this.query.find({ rating: { $gte: Number(queryObj.rating) } });
      delete queryObj.rating;
    }

    // Advanced filtering — gt, gte, lt, lte
    let queryStr = JSON.stringify(queryObj);
    queryStr     = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (m) => `$${m}`);
    this.query   = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy   = this.queryString.sort.split(",").join(" ");
      this.query     = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate(defaultLimit = 12) {
    const page  = Number(this.queryString.page)  || 1;
    const limit = Number(this.queryString.limit) || defaultLimit;
    const skip  = (page - 1) * limit;
    this.query  = this.query.skip(skip).limit(limit);
    this.page   = page;
    this.limit  = limit;
    return this;
  }
}

export default APIFeatures;