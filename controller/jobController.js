const Job = require("../model/jobs");
//const User = require('../model/user');
// const geoCoder = require('../utils/geocoder');

const ErrorHandler = require("../utils/errorhandle");

const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFilter = require("../utils/apifilter");

// const geoCoder = require("../");

//get all jobs  => /api/v1
exports.getJobs = async (req, res, next) => {
  const apifilter = new APIFilter(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagination();

  const jobs = await apifilter.query;

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs
  });
};

// Update a Job  =>  /api/v1/job/:id
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // Check if the user is owner
  if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `User(${req.user.id}) is not allowed to update this job.`
      )
    );
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    message: "Job is updated.",
    data: job
  });
});

// Delete a Job  =>  /api/v1/job/:id
exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // Check if the user is owner
  if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `User(${req.user.id}) is not allowed to delete this job.`
      )
    );
  }

  await job.remove();

  res.status(200).json({
    success: true,
    message: "Job is deleted."
  });
});

//Search jobs with radius =>  /api/v1/jobs/:zipcode/:distance
exports.getJobInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //get latitude and longitude from geocoder  with zipcode
  const loc = await geoCoder.geocode(zipcode);
  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  const radius = distance / 3963;

  const jobs = await Job.find({
    location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
  });

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs
  });
});

// Get a single job with id and slug => /api/v1/job/:id/:slug
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }]
  });

  if (!job || job.length === 0) {
    return next(new ErrorHandler("Job not found", 404));
  }

  res.status(200).json({
    success: true,
    data: job
  });
});
// Get stats about a topic(job)  =>  /api/v1/stats/:topic
exports.jobStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      $match: { $text: { $search: '"' + req.params.topic + '"' } }
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" }
      }
    }
  ]);

  if (stats.length === 0) {
    return next(
      new ErrorHandler(`No stats found for - ${req.params.topic}`, 200)
    );
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});

// Create new controller for a new job => api/v1/job/new
exports.newJob = catchAsyncErrors(async (req, res, next) => {
  
  //adding user to body
  req.body.user = req.user.id;
  
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    requestMethod: req.requestMethod,
    message: "this routes will be create new job in future"
  });
});
