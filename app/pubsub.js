import bluebird from 'bluebird'

import models from './models'

export default class pubSub {
  constructor(publisher) {
    this.publisher = publisher
  }

  async newPost(postId) {
    var post = await models.Post.findById(postId)
    var timelines = await post.getTimelines()

    var promises = timelines.map(async (timeline) => {
      let isBanned = await post.isBannedFor(timeline.userId)

      if (!isBanned) {
        let payload = JSON.stringify({ postId: postId, timelineId: timeline.id })
        await this.publisher.publish('post:new', payload)
      }
    })

    await bluebird.all(promises)
  }

  async destroyPost(postId) {
    var post = await models.Post.findById(postId)
    var timelineIds = await post.getTimelineIds()

    var promises = timelineIds.map(async (timelineId) => {
      let jsonedPost = JSON.stringify({ postId: postId, timelineId: timelineId })
      await this.publisher.publish('post:destroy', jsonedPost)
    })

    await bluebird.all(promises)
  }

  async updatePost(postId) {
    var post = await models.Post.findById(postId)
    var timelineIds = await post.getTimelineIds()

    var promises = timelineIds.map(async (timelineId) => {
      let jsonedPost = JSON.stringify({ postId: postId, timelineId: timelineId })
      await this.publisher.publish('post:update', jsonedPost)
    })

    await bluebird.all(promises)

    let payload = JSON.stringify({ postId: postId})
    await this.publisher.publish('post:update', payload)
  }

  async newComment(comment, timelines) {
    let post = await comment.getPost()
    let promises = timelines.map(async (timeline) => {
      if (await post.isHiddenIn(timeline))
        return

      let payload = JSON.stringify({ timelineId: timeline.id, commentId: comment.id })
      await this.publisher.publish('comment:new', payload)
    })

    await bluebird.all(promises)

    let payload = JSON.stringify({ postId: post.id, commentId: comment.id })
    await this.publisher.publish('comment:new', payload)
  }

  async destroyComment(commentId, postId) {
    var post = await models.Post.findById(postId)
    let payload = JSON.stringify({ postId: postId, commentId: commentId })
    await this.publisher.publish('comment:destroy', payload)

    var timelineIds = await post.getTimelineIds()
    var promises = timelineIds.map(async (timelineId) => {
      let payload = JSON.stringify({postId: postId,  timelineId: timelineId, commentId: commentId })
      await this.publisher.publish('comment:destroy',payload)
    })

    await* promises

  }

  async updateComment(commentId) {
    var comment = await models.Comment.findById(commentId)
    var post = await comment.getPost()

    let payload = JSON.stringify({ postId: post.id, commentId: commentId })
    await this.publisher.publish('comment:update', payload)

    var timelineIds = await post.getTimelineIds()
    var promises = timelineIds.map(async (timelineId) => {
      let payload = JSON.stringify({ timelineId: timelineId, commentId: commentId })
      await this.publisher.publish('comment:update', payload)
    })

    await bluebird.all(promises)
  }

  async newLike(post, userId, timelines) {
    var promises = timelines.map(async (timeline) => {
      // no need to notify users about updates to hidden posts
      if (await post.isHiddenIn(timeline))
        return

      let payload = JSON.stringify({ timelineId: timeline.id, userId: userId, postId: post.id })
      await this.publisher.publish('like:new', payload)
    })

    await bluebird.all(promises)

    let payload = JSON.stringify({ userId: userId, postId: post.id })
    await this.publisher.publish('like:new', payload)
  }

  async removeLike(postId, userId) {
    var post = await models.Post.findById(postId)
    var timelineIds = await post.getTimelineIds()

    var promises = timelineIds.map(async (timelineId) => {
      let payload = JSON.stringify({ timelineId: timelineId, userId: userId, postId: postId })
      await this.publisher.publish('like:remove', payload)
    })

    await bluebird.all(promises)

    let payload = JSON.stringify({ userId: userId, postId: postId })
    await this.publisher.publish('like:remove', payload)
  }

  async hidePost(userId, postId) {
    var user = await models.User.findById(userId)
    var riverOfNewsId = await user.getRiverOfNewsTimelineId()

    var payload = JSON.stringify({ timelineId: riverOfNewsId, postId: postId })
    await this.publisher.publish('post:hide', payload)
  }

  async unhidePost(userId, postId) {
    var user = await models.User.findById(userId)
    var riverOfNewsId = await user.getRiverOfNewsTimelineId()

    var payload = JSON.stringify({ timelineId: riverOfNewsId, postId: postId })
    await this.publisher.publish('post:unhide', payload)
  }
}
