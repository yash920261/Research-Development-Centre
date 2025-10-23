// Forum data utilities for localStorage
export interface ForumTag {
  id: string
  name: string
}

export interface ForumAuthor {
  id: string
  name: string
  avatar: string
  department: string
  joinDate: string
}

export interface ForumReply {
  id: string
  author: ForumAuthor
  content: string
  createdAt: string
  likes: number
  liked?: boolean
}

export interface ForumTopic {
  id: string
  title: string
  content: string
  author: ForumAuthor
  category: string
  createdAt: string
  views: number
  replies: ForumReply[]
  tags: string[]
  liked?: boolean
  likes: number
}

const STORAGE_KEY = "forumTopics"

// Initialize default forum data
const defaultTopics: ForumTopic[] = [
  {
    id: "1",
    title: "Machine Learning approaches for climate data analysis",
    content:
      "I'm working on a research project that involves analyzing large sets of climate data to identify patterns and make predictions about future climate trends. I've been exploring different machine learning approaches, but I'm curious about what others have found effective in similar contexts.\n\nSpecifically, I'm interested in:\n- Which ML algorithms have you found most effective for time-series climate data?\n- How are you handling the high dimensionality of climate datasets?\n- What preprocessing techniques have yielded the best results?\n- Are there any specific libraries or tools you'd recommend?\n\nI've been experimenting with both traditional methods (random forests, SVMs) and deep learning approaches (RNNs, LSTMs), but I'm finding that each has its own challenges when applied to climate data.\n\nAny insights or experiences you could share would be greatly appreciated!",
    author: {
      id: "user1",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Computer Science",
      joinDate: "Member since Sep 2023",
    },
    category: "Technology & Innovation",
    createdAt: "May 8, 2025",
    views: 342,
    likes: 5,
    tags: ["Machine Learning", "Climate Science", "Data Analysis"],
    replies: [
      {
        id: "reply1",
        author: {
          id: "user2",
          name: "Dr. Sarah Chen",
          avatar: "/placeholder.svg?height=40&width=40",
          department: "Physics",
          joinDate: "Member since Jan 2020",
        },
        content:
          "Great question, Alex! In my research on quantum computing applications for climate modeling, I've found that ensemble methods tend to perform particularly well for climate data.\n\nFor preprocessing, I'd recommend:\n- Robust normalization techniques to handle outliers\n- Dimensionality reduction via PCA or t-SNE before feeding into your models\n- Careful handling of missing data (which is common in climate datasets)\n\nAs for libraries, have you tried using xarray with scikit-learn? It's specifically designed for working with multi-dimensional arrays and labeled data, which makes it perfect for climate datasets.\n\nI'd be happy to share some of my preprocessing scripts if that would be helpful!",
        createdAt: "May 8, 2025",
        likes: 15,
      },
      {
        id: "reply2",
        author: {
          id: "user3",
          name: "Carlos Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40",
          department: "Environmental Science",
          joinDate: "Member since Mar 2022",
        },
        content:
          "From an environmental science perspective, I've found that the temporal aspects of climate data often require special attention. LSTMs have worked well for us, but we've had to make several adaptations:\n\n1. Incorporating multiple timescales (daily, seasonal, annual cycles)\n2. Adding attention mechanisms to help the model focus on relevant patterns\n3. Using transfer learning from pre-trained models on similar datasets\n\nOne challenge we faced was dealing with the spatial components alongside temporal data. For this, we implemented a hybrid CNN-LSTM architecture that could capture both spatial patterns and temporal dependencies.\n\nHappy to discuss more specific approaches if you're interested!",
        createdAt: "May 9, 2025",
        likes: 8,
      },
    ],
  },
  {
    id: "2",
    title: "Seeking collaborators for sustainable architecture project",
    content:
      "I'm initiating a new research project focused on sustainable architecture and green building design. We're looking for collaborators from various disciplines to contribute their expertise.\n\nProject scope includes:\n- Energy-efficient building design\n- Sustainable materials research\n- Urban planning integration\n- Environmental impact assessment\n\nIf you're interested in contributing or learning more, please reply to this thread!",
    author: {
      id: "user4",
      name: "Maya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Architecture",
      joinDate: "Member since Jun 2023",
    },
    category: "Collaboration Opportunities",
    createdAt: "May 7, 2025",
    views: 189,
    likes: 3,
    tags: ["Sustainability", "Architecture", "Urban Planning"],
    replies: [],
  },
]

export function initializeForumData(): void {
  if (typeof window === "undefined") return

  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTopics))
  }
}

export function getForumTopics(): ForumTopic[] {
  if (typeof window === "undefined") return []

  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : defaultTopics
}

export function getForumTopicById(id: string): ForumTopic | null {
  if (typeof window === "undefined") return null

  const topics = getForumTopics()
  return topics.find((topic) => topic.id === id) || null
}

export function createForumTopic(topic: Omit<ForumTopic, "id" | "views" | "replies" | "likes">): ForumTopic {
  if (typeof window === "undefined") return topic as ForumTopic

  const topics = getForumTopics()
  const newTopic: ForumTopic = {
    ...topic,
    id: Date.now().toString(),
    views: 1,
    replies: [],
    likes: 0,
  }

  topics.push(newTopic)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))

  return newTopic
}

export function addReplyToTopic(topicId: string, reply: Omit<ForumReply, "id" | "likes">): ForumReply | null {
  if (typeof window === "undefined") return null

  const topics = getForumTopics()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic) return null

  const newReply: ForumReply = {
    ...reply,
    id: Date.now().toString(),
    likes: 0,
  }

  topic.replies.push(newReply)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))

  return newReply
}

export function toggleTopicLike(topicId: string, userId: string): void {
  if (typeof window === "undefined") return

  const topics = getForumTopics()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic) return

  // Store likes as a simple counter for now
  // Later with Supabase, you'd check if user already liked it
  topic.likes = (topic.likes || 0) + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))
}

export function toggleReplyLike(topicId: string, replyId: string, userId: string): void {
  if (typeof window === "undefined") return

  const topics = getForumTopics()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic) return

  const reply = topic.replies.find((r) => r.id === replyId)
  if (!reply) return

  reply.likes = (reply.likes || 0) + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))
}

export function incrementTopicViews(topicId: string): void {
  if (typeof window === "undefined") return

  const topics = getForumTopics()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic) return

  topic.views = (topic.views || 0) + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))
}
