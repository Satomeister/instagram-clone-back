module.exports = {
  user: [
    {
      path: "followers",
      populate: {
        path: "story",
        populate: {
          path: "author",
          select: "fullname username avatar",
        },
      },
      select: "fullname username avatar story",
    },
    {
      path: "following",
      populate: {
        path: "story",
        populate: {
          path: "author",
          select: "fullname username avatar",
        },
      },
      select: "fullname username avatar story",
    },
    {
      path: "posts",
      select: "media likesCount commentsCount",
    },
    {
      path: "story",
      populate: {
        path: "author",
        select: "fullname username avatar",
      },
    },
  ],
};
