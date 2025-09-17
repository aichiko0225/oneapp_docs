# OneApp Community - 社区模块文档

## 模块概述

`oneapp_community` 是 OneApp 的用户社区模块，提供车主社交、内容分享、话题讨论、活动参与等功能。该模块集成了多媒体内容展示、用户互动、内容管理等核心功能，为车主用户构建活跃的社区生态。

### 基本信息
- **模块名称**: oneapp_community
- **版本**: 0.0.3
- **类型**: Flutter Package
- **Dart 版本**: >=3.0.0 <4.0.0
- **Flutter 版本**: >=1.17.0

## 目录结构

```
oneapp_community/
├── lib/
│   ├── oneapp_community.dart     # 主导出文件
│   └── src/                      # 源代码目录
│       ├── pages/                # 社区页面
│       ├── widgets/              # 社区组件
│       ├── models/               # 数据模型
│       ├── services/             # 服务层
│       ├── blocs/                # 状态管理
│       └── utils/                # 工具类
├── assets/                       # 静态资源
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 内容发布与管理

#### 内容发布系统
```dart
// 内容发布服务
class ContentPublishService {
  final CommunityRepository _repository;
  final MediaService _mediaService;
  final UserService _userService;
  
  ContentPublishService(
    this._repository,
    this._mediaService,
    this._userService,
  );
  
  // 发布图文内容
  Future<Result<Post>> publishTextPost({
    required String content,
    required List<String> tags,
    List<File>? images,
    String? location,
    PostPrivacy privacy = PostPrivacy.public,
  }) async {
    try {
      // 1. 上传图片
      List<String> imageUrls = [];
      if (images != null && images.isNotEmpty) {
        final uploadResults = await Future.wait(
          images.map((image) => _mediaService.uploadImage(image)),
        );
        imageUrls = uploadResults.where((url) => url != null).cast<String>().toList();
      }
      
      // 2. 创建帖子
      final post = Post(
        id: generateId(),
        authorId: _userService.currentUserId,
        content: content,
        images: imageUrls,
        tags: tags,
        location: location,
        privacy: privacy,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      // 3. 保存到数据库
      final savedPost = await _repository.createPost(post);
      
      // 4. 通知相关用户
      await _notifyFollowers(savedPost);
      
      return Right(savedPost);
    } catch (e) {
      return Left(CommunityFailure.publishFailed(e.toString()));
    }
  }
  
  // 发布视频内容
  Future<Result<Post>> publishVideoPost({
    required String content,
    required File video,
    File? thumbnail,
    required List<String> tags,
    String? location,
  }) async {
    try {
      // 1. 上传视频
      final videoUrl = await _mediaService.uploadVideo(video);
      if (videoUrl == null) {
        return Left(CommunityFailure.videoUploadFailed());
      }
      
      // 2. 上传缩略图或生成缩略图
      String? thumbnailUrl;
      if (thumbnail != null) {
        thumbnailUrl = await _mediaService.uploadImage(thumbnail);
      } else {
        thumbnailUrl = await _mediaService.generateVideoThumbnail(videoUrl);
      }
      
      // 3. 创建视频帖子
      final post = Post(
        id: generateId(),
        authorId: _userService.currentUserId,
        content: content,
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        tags: tags,
        location: location,
        type: PostType.video,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      final savedPost = await _repository.createPost(post);
      return Right(savedPost);
    } catch (e) {
      return Left(CommunityFailure.publishFailed(e.toString()));
    }
  }
  
  // 分享车辆状态
  Future<Result<Post>> shareVehicleStatus({
    required String vehicleId,
    required VehicleStatus status,
    String? content,
    List<String>? tags,
  }) async {
    try {
      final post = Post(
        id: generateId(),
        authorId: _userService.currentUserId,
        content: content ?? '分享我的爱车状态',
        tags: tags ?? ['车辆状态'],
        vehicleData: VehicleShareData.fromStatus(vehicleId, status),
        type: PostType.vehicleShare,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      final savedPost = await _repository.createPost(post);
      return Right(savedPost);
    } catch (e) {
      return Left(CommunityFailure.publishFailed(e.toString()));
    }
  }
}
```

### 2. 内容浏览与互动

#### 内容流管理
```dart
// 社区内容流服务
class CommunityFeedService {
  final CommunityRepository _repository;
  final UserPreferenceService _preferenceService;
  final RecommendationEngine _recommendationEngine;
  
  CommunityFeedService(
    this._repository,
    this._preferenceService,
    this._recommendationEngine,
  );
  
  // 获取个性化内容流
  Future<Result<List<Post>>> getPersonalizedFeed({
    int page = 1,
    int pageSize = 20,
    FeedType type = FeedType.recommended,
  }) async {
    try {
      final userPreferences = await _preferenceService.getUserPreferences();
      
      List<Post> posts;
      switch (type) {
        case FeedType.recommended:
          posts = await _getRecommendedPosts(userPreferences, page, pageSize);
          break;
        case FeedType.following:
          posts = await _getFollowingPosts(page, pageSize);
          break;
        case FeedType.latest:
          posts = await _getLatestPosts(page, pageSize);
          break;
        case FeedType.trending:
          posts = await _getTrendingPosts(page, pageSize);
          break;
      }
      
      return Right(posts);
    } catch (e) {
      return Left(CommunityFailure.feedLoadFailed(e.toString()));
    }
  }
  
  // 获取推荐内容
  Future<List<Post>> _getRecommendedPosts(
    UserPreferences preferences,
    int page,
    int pageSize,
  ) async {
    final recommendations = await _recommendationEngine.getRecommendations(
      userId: _userService.currentUserId,
      preferences: preferences,
      page: page,
      pageSize: pageSize,
    );
    
    return await _repository.getPostsByIds(recommendations.postIds);
  }
  
  // 搜索内容
  Future<Result<SearchResult>> searchContent({
    required String keyword,
    List<String>? tags,
    PostType? type,
    String? location,
    DateRange? dateRange,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final searchParams = SearchParams(
        keyword: keyword,
        tags: tags,
        type: type,
        location: location,
        dateRange: dateRange,
        page: page,
        pageSize: pageSize,
      );
      
      final searchResult = await _repository.searchPosts(searchParams);
      return Right(searchResult);
    } catch (e) {
      return Left(CommunityFailure.searchFailed(e.toString()));
    }
  }
}

// 内容互动服务
class ContentInteractionService {
  final CommunityRepository _repository;
  final NotificationService _notificationService;
  
  ContentInteractionService(this._repository, this._notificationService);
  
  // 点赞/取消点赞
  Future<Result<void>> toggleLike(String postId) async {
    try {
      final isLiked = await _repository.isPostLiked(postId, _userService.currentUserId);
      
      if (isLiked) {
        await _repository.unlikePost(postId, _userService.currentUserId);
      } else {
        await _repository.likePost(postId, _userService.currentUserId);
        
        // 发送点赞通知
        final post = await _repository.getPostById(postId);
        if (post != null && post.authorId != _userService.currentUserId) {
          await _notificationService.sendLikeNotification(
            targetUserId: post.authorId,
            postId: postId,
            likerUserId: _userService.currentUserId,
          );
        }
      }
      
      return Right(unit);
    } catch (e) {
      return Left(CommunityFailure.interactionFailed(e.toString()));
    }
  }
  
  // 评论
  Future<Result<Comment>> addComment({
    required String postId,
    required String content,
    String? parentCommentId,
    List<String>? mentionedUserIds,
  }) async {
    try {
      final comment = Comment(
        id: generateId(),
        postId: postId,
        authorId: _userService.currentUserId,
        content: content,
        parentCommentId: parentCommentId,
        mentionedUserIds: mentionedUserIds ?? [],
        createdAt: DateTime.now(),
      );
      
      final savedComment = await _repository.createComment(comment);
      
      // 发送评论通知
      await _sendCommentNotifications(savedComment);
      
      return Right(savedComment);
    } catch (e) {
      return Left(CommunityFailure.commentFailed(e.toString()));
    }
  }
  
  // 分享
  Future<Result<void>> sharePost({
    required String postId,
    required ShareTarget target,
    String? message,
  }) async {
    try {
      final post = await _repository.getPostById(postId);
      if (post == null) {
        return Left(CommunityFailure.postNotFound());
      }
      
      await _repository.recordShare(postId, _userService.currentUserId, target);
      
      // 根据分享目标执行相应操作
      switch (target) {
        case ShareTarget.internal:
          await _shareToInternalFeed(post, message);
          break;
        case ShareTarget.wechat:
          await _shareToWeChat(post);
          break;
        case ShareTarget.weibo:
          await _shareToWeibo(post);
          break;
        default:
          break;
      }
      
      return Right(unit);
    } catch (e) {
      return Left(CommunityFailure.shareFailed(e.toString()));
    }
  }
}
```

### 3. 用户关系管理

#### 关注系统
```dart
// 用户关系服务
class UserRelationshipService {
  final CommunityRepository _repository;
  final NotificationService _notificationService;
  
  UserRelationshipService(this._repository, this._notificationService);
  
  // 关注用户
  Future<Result<void>> followUser(String targetUserId) async {
    try {
      if (targetUserId == _userService.currentUserId) {
        return Left(CommunityFailure.cannotFollowSelf());
      }
      
      final isAlreadyFollowing = await _repository.isFollowing(
        _userService.currentUserId,
        targetUserId,
      );
      
      if (isAlreadyFollowing) {
        return Left(CommunityFailure.alreadyFollowing());
      }
      
      await _repository.followUser(_userService.currentUserId, targetUserId);
      
      // 发送关注通知
      await _notificationService.sendFollowNotification(
        targetUserId: targetUserId,
        followerUserId: _userService.currentUserId,
      );
      
      return Right(unit);
    } catch (e) {
      return Left(CommunityFailure.followFailed(e.toString()));
    }
  }
  
  // 取消关注
  Future<Result<void>> unfollowUser(String targetUserId) async {
    try {
      await _repository.unfollowUser(_userService.currentUserId, targetUserId);
      return Right(unit);
    } catch (e) {
      return Left(CommunityFailure.unfollowFailed(e.toString()));
    }
  }
  
  // 获取关注列表
  Future<Result<List<UserProfile>>> getFollowing({
    String? userId,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final targetUserId = userId ?? _userService.currentUserId;
      final followingList = await _repository.getFollowing(
        targetUserId,
        page,
        pageSize,
      );
      return Right(followingList);
    } catch (e) {
      return Left(CommunityFailure.loadFollowingFailed(e.toString()));
    }
  }
  
  // 获取粉丝列表
  Future<Result<List<UserProfile>>> getFollowers({
    String? userId,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final targetUserId = userId ?? _userService.currentUserId;
      final followersList = await _repository.getFollowers(
        targetUserId,
        page,
        pageSize,
      );
      return Right(followersList);
    } catch (e) {
      return Left(CommunityFailure.loadFollowersFailed(e.toString()));
    }
  }
  
  // 获取共同关注
  Future<Result<List<UserProfile>>> getMutualFollowing(String userId) async {
    try {
      final mutualFollowing = await _repository.getMutualFollowing(
        _userService.currentUserId,
        userId,
      );
      return Right(mutualFollowing);
    } catch (e) {
      return Left(CommunityFailure.loadMutualFollowingFailed(e.toString()));
    }
  }
}
```

### 4. 话题与标签系统

#### 话题管理
```dart
// 话题服务
class TopicService {
  final CommunityRepository _repository;
  final TrendingAnalyzer _trendingAnalyzer;
  
  TopicService(this._repository, this._trendingAnalyzer);
  
  // 获取热门话题
  Future<Result<List<Topic>>> getTrendingTopics({
    int limit = 20,
    Duration? timeRange,
  }) async {
    try {
      final topics = await _trendingAnalyzer.getTrendingTopics(
        limit: limit,
        timeRange: timeRange ?? Duration(days: 7),
      );
      return Right(topics);
    } catch (e) {
      return Left(CommunityFailure.loadTopicsFailed(e.toString()));
    }
  }
  
  // 搜索话题
  Future<Result<List<Topic>>> searchTopics(String keyword) async {
    try {
      final topics = await _repository.searchTopics(keyword);
      return Right(topics);
    } catch (e) {
      return Left(CommunityFailure.searchTopicsFailed(e.toString()));
    }
  }
  
  // 关注话题
  Future<Result<void>> followTopic(String topicId) async {
    try {
      await _repository.followTopic(_userService.currentUserId, topicId);
      return Right(unit);
    } catch (e) {
      return Left(CommunityFailure.followTopicFailed(e.toString()));
    }
  }
  
  // 获取话题下的内容
  Future<Result<List<Post>>> getTopicPosts({
    required String topicId,
    int page = 1,
    int pageSize = 20,
    PostSortType sortType = PostSortType.latest,
  }) async {
    try {
      final posts = await _repository.getTopicPosts(
        topicId: topicId,
        page: page,
        pageSize: pageSize,
        sortType: sortType,
      );
      return Right(posts);
    } catch (e) {
      return Left(CommunityFailure.loadTopicPostsFailed(e.toString()));
    }
  }
}
```

### 5. 多媒体内容处理

#### 视频播放器集成
```dart
// 社区视频播放器
class CommunityVideoPlayer extends StatefulWidget {
  final String videoUrl;
  final String? thumbnailUrl;
  final bool autoPlay;
  final bool showControls;
  final VoidCallback? onPlayComplete;
  
  const CommunityVideoPlayer({
    Key? key,
    required this.videoUrl,
    this.thumbnailUrl,
    this.autoPlay = false,
    this.showControls = true,
    this.onPlayComplete,
  }) : super(key: key);
  
  @override
  _CommunityVideoPlayerState createState() => _CommunityVideoPlayerState();
}

class _CommunityVideoPlayerState extends State<CommunityVideoPlayer> {
  late SuperPlayerController _controller;
  bool _isInitialized = false;
  
  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }
  
  void _initializePlayer() {
    _controller = SuperPlayerController();
    
    final playerConfig = SuperPlayerModel();
    playerConfig.videoURL = widget.videoUrl;
    playerConfig.title = '社区视频';
    playerConfig.coverURL = widget.thumbnailUrl;
    
    _controller.playWithModel(playerConfig);
    
    _controller.onSimplePlayerEventBroadcast.listen((event) {
      if (event['event'] == SuperPlayerViewEvent.onPlayEnd) {
        widget.onPlayComplete?.call();
      }
    });
    
    setState(() {
      _isInitialized = true;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return _buildLoadingState();
    }
    
    return SuperPlayerView(
      _controller,
      isFullScreen: false,
      showLeftBackBtn: false,
    );
  }
  
  Widget _buildLoadingState() {
    return Container(
      height: 200,
      color: Colors.black12,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 8),
            Text('加载中...'),
          ],
        ),
      ),
    );
  }
  
  @override
  void dispose() {
    _controller.releasePlayer();
    super.dispose();
  }
}
```

## 数据模型

### 核心数据模型
```dart
// 帖子模型
class Post {
  final String id;
  final String authorId;
  final String content;
  final List<String> images;
  final String? videoUrl;
  final String? thumbnailUrl;
  final List<String> tags;
  final String? location;
  final PostType type;
  final PostPrivacy privacy;
  final VehicleShareData? vehicleData;
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const Post({
    required this.id,
    required this.authorId,
    required this.content,
    this.images = const [],
    this.videoUrl,
    this.thumbnailUrl,
    this.tags = const [],
    this.location,
    this.type = PostType.text,
    this.privacy = PostPrivacy.public,
    this.vehicleData,
    this.likeCount = 0,
    this.commentCount = 0,
    this.shareCount = 0,
    required this.createdAt,
    required this.updatedAt,
  });
}

// 评论模型
class Comment {
  final String id;
  final String postId;
  final String authorId;
  final String content;
  final String? parentCommentId;
  final List<String> mentionedUserIds;
  final int likeCount;
  final List<Comment> replies;
  final DateTime createdAt;
  
  const Comment({
    required this.id,
    required this.postId,
    required this.authorId,
    required this.content,
    this.parentCommentId,
    this.mentionedUserIds = const [],
    this.likeCount = 0,
    this.replies = const [],
    required this.createdAt,
  });
}

// 用户资料模型
class UserProfile {
  final String id;
  final String username;
  final String? displayName;
  final String? avatar;
  final String? bio;
  final String? location;
  final int followingCount;
  final int followersCount;
  final int postsCount;
  final bool isVerified;
  final DateTime joinedAt;
  
  const UserProfile({
    required this.id,
    required this.username,
    this.displayName,
    this.avatar,
    this.bio,
    this.location,
    this.followingCount = 0,
    this.followersCount = 0,
    this.postsCount = 0,
    this.isVerified = false,
    required this.joinedAt,
  });
}
```

## UI 组件设计

### 帖子卡片组件
```dart
// 帖子卡片组件
class PostCard extends StatelessWidget {
  final Post post;
  final UserProfile author;
  final VoidCallback? onTap;
  final VoidCallback? onLike;
  final VoidCallback? onComment;
  final VoidCallback? onShare;
  
  const PostCard({
    Key? key,
    required this.post,
    required this.author,
    this.onTap,
    this.onLike,
    this.onComment,
    this.onShare,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              SizedBox(height: 12),
              _buildContent(),
              if (post.images.isNotEmpty) ...[
                SizedBox(height: 12),
                _buildImageGrid(),
              ],
              if (post.videoUrl != null) ...[
                SizedBox(height: 12),
                _buildVideoPlayer(),
              ],
              if (post.vehicleData != null) ...[
                SizedBox(height: 12),
                _buildVehicleData(),
              ],
              SizedBox(height: 12),
              _buildInteractionBar(),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildHeader() {
    return Row(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundImage: author.avatar != null
              ? NetworkImage(author.avatar!)
              : null,
          child: author.avatar == null
              ? Text(author.username[0].toUpperCase())
              : null,
        ),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    author.displayName ?? author.username,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  if (author.isVerified) ...[
                    SizedBox(width: 4),
                    Icon(
                      Icons.verified,
                      size: 16,
                      color: Colors.blue,
                    ),
                  ],
                ],
              ),
              Text(
                timeago.format(post.createdAt),
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          icon: Icon(Icons.more_vert),
          onPressed: () => _showPostMenu(context),
        ),
      ],
    );
  }
  
  Widget _buildContent() {
    return Text(
      post.content,
      style: TextStyle(fontSize: 16),
    );
  }
  
  Widget _buildInteractionBar() {
    return Row(
      children: [
        _buildInteractionButton(
          icon: Icons.favorite_border,
          count: post.likeCount,
          onTap: onLike,
        ),
        SizedBox(width: 24),
        _buildInteractionButton(
          icon: Icons.comment_outlined,
          count: post.commentCount,
          onTap: onComment,
        ),
        SizedBox(width: 24),
        _buildInteractionButton(
          icon: Icons.share_outlined,
          count: post.shareCount,
          onTap: onShare,
        ),
      ],
    );
  }
}
```

## 依赖管理

### 集成模块依赖
- **basic_utils**: 基础工具类
- **basic_uis**: 基础 UI 组件
- **oneapp_membership**: 会员系统集成
- **oneapp_car_sales**: 汽车销售集成
- **oneapp_touch_point**: 触点管理集成
- **oneapp_after_sales**: 售后服务集成
- **share_to_friends**: 分享功能组件

### 多媒体依赖
- **superplayer_widget**: 腾讯云超级播放器，用于视频播放

## 错误处理

### 社区特定异常
```dart
// 社区功能异常
abstract class CommunityFailure {
  const CommunityFailure();
  
  factory CommunityFailure.publishFailed(String message) = PublishFailure;
  factory CommunityFailure.feedLoadFailed(String message) = FeedLoadFailure;
  factory CommunityFailure.interactionFailed(String message) = InteractionFailure;
  factory CommunityFailure.followFailed(String message) = FollowFailure;
  factory CommunityFailure.contentNotFound() = ContentNotFoundFailure;
  factory CommunityFailure.permissionDenied() = PermissionDeniedFailure;
}
```

## 总结

`oneapp_community` 模块为 OneApp 构建了完整的车主社区生态，通过内容发布、互动分享、用户关系等功能，促进了车主之间的交流与互动。模块集成了多媒体播放、分享组件等功能，并与其他业务模块深度整合，为用户提供了丰富的社区体验。
