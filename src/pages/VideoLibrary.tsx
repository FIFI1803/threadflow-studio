import { useState } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Play,
  Download,
  Share2,
  MoreVertical,
  Grid3x3,
  List,
  Search,
  Filter,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - replace with actual data from Supabase
const mockVideos = [
  {
    id: "1",
    title: "Tech Conference Bombshell",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    duration: "0:45",
    views: "12.5K",
    status: "published",
    createdAt: "2024-02-15",
  },
  {
    id: "2",
    title: "Breaking News Story",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
    duration: "0:38",
    views: "8.2K",
    status: "draft",
    createdAt: "2024-02-14",
  },
  {
    id: "3",
    title: "Product Launch Reveal",
    thumbnail: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=400&h=300&fit=crop",
    duration: "0:52",
    views: "15.8K",
    status: "published",
    createdAt: "2024-02-13",
  },
];

export default function VideoLibrary() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: string) => {
    return status === "published"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Video Library</h1>
          </div>
          <p className="text-muted-foreground">
            Manage and export your generated videos
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {mockVideos.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate your first video from a script to get started
            </p>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Create First Video
            </Button>
          </Card>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mockVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="icon"
                            className="w-12 h-12 rounded-full"
                          >
                            <Play className="w-5 h-5" fill="currentColor" />
                          </Button>
                        </div>
                        {/* Duration */}
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
                          {video.duration}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold line-clamp-2 flex-1">
                            {video.title}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0 ml-2"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Play className="w-4 h-4 mr-2" />
                                Play
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={getStatusColor(video.status)}
                          >
                            {video.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {video.views} views
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-2">
                {mockVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-all hover:border-primary/50">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-medium">
                            {video.duration}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge
                              variant="outline"
                              className={getStatusColor(video.status)}
                            >
                              {video.status}
                            </Badge>
                            <span>{video.views} views</span>
                            <span>{video.createdAt}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
