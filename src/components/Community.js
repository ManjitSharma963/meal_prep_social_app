import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Star, Camera, Plus, Filter } from 'lucide-react';
import '../styles/admin-components.css';

const Community = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [newPost, setNewPost] = useState({ content: '', image: null });

  const filters = ['All', 'Recent', 'Popular', 'Following', 'Challenges'];

  const samplePosts = [
    {
      id: 1,
      user: {
        name: 'Priya Sharma',
        avatar: 'PS',
        verified: true
      },
      content: 'Just made the most amazing Masala Dosa! The secret is in the batter consistency. Who else loves crispy dosas? 🥞',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop',
      likes: 24,
      comments: 8,
      shares: 3,
      timeAgo: '2 hours ago',
      tags: ['#MasalaDosa', '#SouthIndian', '#Breakfast'],
      liked: false
    },
    {
      id: 2,
      user: {
        name: 'Raj Patel',
        avatar: 'RP',
        verified: false
      },
      content: '7-day dosa challenge complete! 🎉 Started as a beginner, now I can make perfect dosas. Thanks to this amazing community for all the tips!',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop',
      likes: 45,
      comments: 12,
      shares: 7,
      timeAgo: '5 hours ago',
      tags: ['#DosaChallenge', '#7DayChallenge', '#CookingJourney'],
      liked: true
    },
    {
      id: 3,
      user: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        verified: true
      },
      content: 'Healthy salad challenge day 3! This Caesar salad is so fresh and crunchy. Added some homemade croutons for extra texture.',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop',
      likes: 18,
      comments: 5,
      shares: 2,
      timeAgo: '1 day ago',
      tags: ['#HealthySalad', '#CaesarSalad', '#HealthyEating'],
      liked: false
    },
    {
      id: 4,
      user: {
        name: 'Amit Kumar',
        avatar: 'AK',
        verified: false
      },
      content: 'Paneer Butter Masala turned out perfect today! The key is to cook the onions until they\'re golden brown. Served with naan and rice.',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d4d0?w=600&h=400&fit=crop',
      likes: 32,
      comments: 9,
      shares: 4,
      timeAgo: '2 days ago',
      tags: ['#PaneerButterMasala', '#IndianCuisine', '#Vegetarian'],
      liked: true
    }
  ];

  const challenges = [
    {
      id: 1,
      title: '7-Day Dosa Challenge',
      description: 'Master the art of making perfect dosas in just one week!',
      participants: 156,
      daysLeft: 3,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Healthy Salad Week',
      description: 'Create and share your healthiest salad recipes!',
      participants: 89,
      daysLeft: 5,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Spice Master Challenge',
      description: 'Show off your spice blending skills!',
      participants: 203,
      daysLeft: 7,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop'
    }
  ];

  const toggleLike = (postId) => {
    // In a real app, this would update the backend
    console.log('Toggled like for post:', postId);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const submitPost = () => {
    if (newPost.content.trim()) {
      // In a real app, this would submit to the backend
      console.log('New post:', newPost);
      setNewPost({ content: '', image: null });
    }
  };

  return (
    <div className="community">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community</h1>
        <div className="flex gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {filters.map(filter => (
              <option key={filter} value={filter}>{filter}</option>
            ))}
          </select>
          <button className="btn btn-primary">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            U
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Share your cooking experience, tips, or ask questions..."
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              className="w-full border rounded p-3 resize-none"
              rows="3"
            />
            {newPost.image && (
              <div className="mt-3">
                <img src={newPost.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <label className="btn btn-secondary cursor-pointer">
                  <Camera size={20} />
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <button className="btn btn-primary" onClick={submitPost}>
                <Plus size={20} />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Active Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map(challenge => (
            <div key={challenge.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img src={challenge.image} alt={challenge.title} className="w-full h-32 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{challenge.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-600">{challenge.participants} participants</span>
                  <span className="text-orange-600">{challenge.daysLeft} days left</span>
                </div>
                <button className="btn btn-primary w-full mt-3">Join Challenge</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="posts-grid">
        {samplePosts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="user-avatar">{post.user.avatar}</div>
              <div className="user-info">
                <h4 className="flex items-center gap-1">
                  {post.user.name}
                  {post.user.verified && <span className="text-blue-500">✓</span>}
                </h4>
                <p>{post.timeAgo}</p>
              </div>
            </div>
            
            <div className="post-content">
              <p className="mb-3">{post.content}</p>
              {post.image && (
                <img src={post.image} alt="Post" className="post-image" />
              )}
              <div className="flex gap-2 flex-wrap">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="post-actions">
              <button
                className={`action-btn ${post.liked ? 'liked' : ''}`}
                onClick={() => toggleLike(post.id)}
              >
                <Heart size={20} />
                {post.likes}
              </button>
              <button className="action-btn">
                <MessageCircle size={20} />
                {post.comments}
              </button>
              <button className="action-btn">
                <Share2 size={20} />
                {post.shares}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
