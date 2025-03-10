
import { useState } from 'react';
import { BookOpen, Video, BarChart, Search, Filter, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'infographic';
  tags: string[];
  date: string;
  readTime?: string;
  videoLength?: string;
  thumbnail?: string;
  popularity: number;
}

const SAMPLE_CONTENT: EducationalContent[] = [
  {
    id: '1',
    title: 'Understanding Blood Pressure Readings',
    description: 'Learn how to interpret blood pressure readings and what the numbers mean for your health.',
    type: 'article',
    tags: ['cardiovascular', 'health metrics', 'hypertension'],
    date: '2023-05-15',
    readTime: '5 min read',
    popularity: 98
  },
  {
    id: '2',
    title: 'Common Antibiotic Classes and Their Uses',
    description: 'A comprehensive guide to different types of antibiotics and when they are prescribed.',
    type: 'article',
    tags: ['antibiotics', 'infection', 'medication'],
    date: '2023-06-23',
    readTime: '8 min read',
    popularity: 85
  },
  {
    id: '3',
    title: 'How Vaccines Work: An Illustrated Guide',
    description: 'Visual explanation of how vaccines train your immune system to fight diseases.',
    type: 'infographic',
    tags: ['vaccines', 'immunity', 'prevention'],
    date: '2023-07-10',
    thumbnail: '/placeholder.svg',
    popularity: 92
  },
  {
    id: '4',
    title: 'Understanding Diabetes Medication',
    description: 'A detailed video explanation of different diabetes medications and how they work in the body.',
    type: 'video',
    tags: ['diabetes', 'medication', 'endocrine'],
    date: '2023-08-05',
    videoLength: '12:34',
    thumbnail: '/placeholder.svg',
    popularity: 88
  },
  {
    id: '5',
    title: 'Mental Health Basics: Anxiety Disorders',
    description: 'Learn about different types of anxiety disorders, symptoms, and treatment options.',
    type: 'article',
    tags: ['mental health', 'anxiety', 'psychology'],
    date: '2023-09-18',
    readTime: '10 min read',
    popularity: 95
  },
  {
    id: '6',
    title: 'How MRI Scans Work',
    description: 'A visual explanation of magnetic resonance imaging technology.',
    type: 'video',
    tags: ['diagnostics', 'medical technology', 'imaging'],
    date: '2023-10-02',
    videoLength: '8:17',
    thumbnail: '/placeholder.svg',
    popularity: 82
  },
  {
    id: '7',
    title: 'Guide to Heart-Healthy Nutrition',
    description: 'Dietary recommendations for maintaining cardiovascular health.',
    type: 'infographic',
    tags: ['nutrition', 'cardiovascular', 'prevention'],
    date: '2023-10-25',
    thumbnail: '/placeholder.svg',
    popularity: 90
  },
  {
    id: '8',
    title: 'Understanding Drug Interactions',
    description: 'How different medications can interact and what to watch out for.',
    type: 'article',
    tags: ['medication', 'safety', 'pharmacology'],
    date: '2023-11-14',
    readTime: '7 min read',
    popularity: 93
  }
];

export const EducationHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(SAMPLE_CONTENT.flatMap(item => item.tags))
  ).sort();

  // Filter content based on search, tab, and tags
  const filteredContent = SAMPLE_CONTENT.filter(item => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by tab
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'articles' && item.type === 'article') ||
      (activeTab === 'videos' && item.type === 'video') ||
      (activeTab === 'infographics' && item.type === 'infographic');
    
    // Filter by selected tags
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some(tag => item.tags.includes(tag));
    
    return matchesSearch && matchesTab && matchesTags;
  });

  // Sort content by popularity
  const sortedContent = [...filteredContent].sort((a, b) => b.popularity - a.popularity);
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setActiveTab('all');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            <span>Health Education Hub</span>
          </div>
        </CardTitle>
        <CardDescription>
          Expand your knowledge with our curated educational content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search for topics, conditions, or medications..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center flex-wrap gap-2">
            <Filter className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-sm text-gray-500 mr-2">Filters:</span>
            
            {allTags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            
            {(searchQuery || selectedTags.length > 0 || activeTab !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-sm"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="infographics">Infographics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedContent.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
                {sortedContent.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No content matches your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="articles" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedContent.filter(item => item.type === 'article').map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
                {sortedContent.filter(item => item.type === 'article').length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No articles match your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedContent.filter(item => item.type === 'video').map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
                {sortedContent.filter(item => item.type === 'video').length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No videos match your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="infographics" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedContent.filter(item => item.type === 'infographic').map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
                {sortedContent.filter(item => item.type === 'infographic').length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No infographics match your search criteria.</p>
                    <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          Content is updated weekly. Last updated {new Date().toLocaleDateString()}
        </p>
        <Button variant="outline" size="sm">
          Suggest a Topic
        </Button>
      </CardFooter>
    </Card>
  );
};

const ContentCard = ({ item }: { item: EducationalContent }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {item.thumbnail && (
        <div 
          className="h-32 bg-gray-100 relative" 
          style={{ backgroundImage: `url(${item.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-white/80 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
            </div>
          )}
          {item.videoLength && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {item.videoLength}
            </div>
          )}
        </div>
      )}
      
      <CardContent className={`${item.thumbnail ? 'pt-4' : 'pt-6'}`}>
        <div className="flex items-center gap-2 mb-2">
          {item.type === 'article' && (
            <Badge variant="secondary" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Article
            </Badge>
          )}
          {item.type === 'video' && (
            <Badge variant="secondary" className="text-xs">
              <Video className="h-3 w-3 mr-1" />
              Video
            </Badge>
          )}
          {item.type === 'infographic' && (
            <Badge variant="secondary" className="text-xs">
              <BarChart className="h-3 w-3 mr-1" />
              Infographic
            </Badge>
          )}
          {item.readTime && (
            <span className="text-xs text-gray-500">{item.readTime}</span>
          )}
        </div>
        
        <h3 className="font-semibold mb-1">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {item.tags.map(tag => (
            <div key={tag} className="flex items-center text-xs text-gray-500">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="link" className="px-0 h-auto text-sm" asChild>
          <a href="#view-content">
            {item.type === 'article' ? 'Read Article' : item.type === 'video' ? 'Watch Video' : 'View Infographic'}
          </a>
        </Button>
        <span className="text-xs text-gray-400">
          {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </CardFooter>
    </Card>
  );
};
