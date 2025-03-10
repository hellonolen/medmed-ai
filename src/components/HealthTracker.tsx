
import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Heart, Plus, BarChart2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type HealthRecord = {
  id: string;
  date: string;
  timestamp: string;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  weight: number;
  sleepHours: number;
  steps: number;
};

export const HealthTracker = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState('heartRate');
  const [formData, setFormData] = useState({
    heartRate: '',
    systolic: '',
    diastolic: '',
    weight: '',
    sleepHours: '',
    steps: ''
  });
  const { toast } = useToast();

  // Load records from localStorage when component mounts
  useEffect(() => {
    const savedRecords = localStorage.getItem('healthTrackerRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    } else {
      // Generate some sample data if there are no saved records
      const sampleData: HealthRecord[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          id: `sample-${i}`,
          date: date.toISOString().split('T')[0],
          timestamp: date.toISOString(),
          heartRate: 70 + Math.floor(Math.random() * 10),
          bloodPressure: {
            systolic: 120 + Math.floor(Math.random() * 10),
            diastolic: 80 + Math.floor(Math.random() * 5)
          },
          weight: 70 + Math.random() * 2,
          sleepHours: 7 + Math.random() * 1.5,
          steps: 5000 + Math.floor(Math.random() * 3000)
        };
      });
      setRecords(sampleData);
      localStorage.setItem('healthTrackerRecords', JSON.stringify(sampleData));
    }
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('healthTrackerRecords', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = () => {
    // Validate form
    if (!formData.heartRate || !formData.systolic || !formData.diastolic || !formData.weight || !formData.sleepHours || !formData.steps) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      heartRate: parseInt(formData.heartRate),
      bloodPressure: {
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic)
      },
      weight: parseFloat(formData.weight),
      sleepHours: parseFloat(formData.sleepHours),
      steps: parseInt(formData.steps)
    };
    
    // Add record and sort by date
    const updatedRecords = [...records, newRecord].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    setRecords(updatedRecords);
    
    // Reset form and close dialog
    setFormData({
      heartRate: '',
      systolic: '',
      diastolic: '',
      weight: '',
      sleepHours: '',
      steps: ''
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Record Added",
      description: "Your health data has been recorded",
    });
  };

  const getChartData = () => {
    return records.map(record => {
      const date = new Date(record.timestamp);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
      
      let value: number;
      switch (activeMetric) {
        case 'heartRate':
          value = record.heartRate;
          break;
        case 'bloodPressure':
          value = record.bloodPressure.systolic;
          break;
        case 'weight':
          value = record.weight;
          break;
        case 'sleepHours':
          value = record.sleepHours;
          break;
        case 'steps':
          value = record.steps;
          break;
        default:
          value = 0;
      }
      
      return {
        date: formattedDate,
        value
      };
    });
  };

  const getLatestRecord = () => {
    if (records.length === 0) return null;
    return records[records.length - 1];
  };

  const latestRecord = getLatestRecord();
  const chartData = getChartData();

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'heartRate':
        return 'bpm';
      case 'bloodPressure':
        return 'mmHg';
      case 'weight':
        return 'kg';
      case 'sleepHours':
        return 'hours';
      case 'steps':
        return 'steps';
      default:
        return '';
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'heartRate':
        return '#ef4444';
      case 'bloodPressure':
        return '#3b82f6';
      case 'weight':
        return '#8b5cf6';
      case 'sleepHours':
        return '#10b981';
      case 'steps':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getTrend = (metric: string) => {
    if (records.length < 2) return 'neutral';
    
    const latest = records[records.length - 1];
    const previous = records[records.length - 2];
    
    let latestValue: number, previousValue: number;
    
    switch (metric) {
      case 'heartRate':
        latestValue = latest.heartRate;
        previousValue = previous.heartRate;
        break;
      case 'bloodPressure':
        latestValue = latest.bloodPressure.systolic;
        previousValue = previous.bloodPressure.systolic;
        break;
      case 'weight':
        latestValue = latest.weight;
        previousValue = previous.weight;
        break;
      case 'sleepHours':
        latestValue = latest.sleepHours;
        previousValue = previous.sleepHours;
        break;
      case 'steps':
        latestValue = latest.steps;
        previousValue = previous.steps;
        break;
      default:
        return 'neutral';
    }
    
    const difference = ((latestValue - previousValue) / previousValue) * 100;
    
    if (difference > 3) return 'up';
    if (difference < -3) return 'down';
    return 'neutral';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            <span>Health Tracker</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <Plus className="h-4 w-4" />
                <span className="ml-1">Add Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Health Metrics</DialogTitle>
                <DialogDescription>
                  Record your current health metrics to track your well-being over time.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      value={formData.heartRate}
                      onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                      placeholder="e.g. 72"
                    />
                  </div>
                  <div>
                    <Label htmlFor="steps">Steps</Label>
                    <Input
                      id="steps"
                      type="number"
                      value={formData.steps}
                      onChange={(e) => setFormData({...formData, steps: e.target.value})}
                      placeholder="e.g. 8000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systolic">Blood Pressure (Systolic)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      value={formData.systolic}
                      onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                      placeholder="e.g. 120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diastolic">Blood Pressure (Diastolic)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      value={formData.diastolic}
                      onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                      placeholder="e.g. 80"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="e.g. 70.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sleepHours">Sleep (hours)</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      step="0.5"
                      value={formData.sleepHours}
                      onChange={(e) => setFormData({...formData, sleepHours: e.target.value})}
                      placeholder="e.g. 7.5"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddRecord}>Save Data</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No health data recorded</p>
            <p className="text-sm mt-1">Add entries to track your health metrics over time</p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <Select
                value={activeMetric}
                onValueChange={setActiveMetric}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric to view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heartRate">Heart Rate</SelectItem>
                  <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="sleepHours">Sleep Hours</SelectItem>
                  <SelectItem value="steps">Steps</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {latestRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Latest Reading</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {activeMetric === 'bloodPressure' 
                          ? `${latestRecord.bloodPressure.systolic}/${latestRecord.bloodPressure.diastolic}` 
                          : activeMetric === 'heartRate' 
                            ? latestRecord.heartRate 
                            : activeMetric === 'weight' 
                              ? latestRecord.weight.toFixed(1) 
                              : activeMetric === 'sleepHours' 
                                ? latestRecord.sleepHours.toFixed(1) 
                                : latestRecord.steps.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          {getMetricUnit(activeMetric)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(latestRecord.timestamp).toLocaleDateString()} at {new Date(latestRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      getTrend(activeMetric) === 'up' 
                        ? 'text-green-500' 
                        : getTrend(activeMetric) === 'down' 
                          ? 'text-red-500' 
                          : 'text-gray-400'
                    }`}>
                      {getTrend(activeMetric) === 'up' && <TrendingUp className="h-5 w-5" />}
                      {getTrend(activeMetric) === 'down' && <TrendingUp className="h-5 w-5 transform rotate-180" />}
                      {getTrend(activeMetric) === 'neutral' && <TrendingUp className="h-5 w-5 transform rotate-90" />}
                      <span className="text-sm">
                        {getTrend(activeMetric) === 'up' 
                          ? 'Trending Up' 
                          : getTrend(activeMetric) === 'down' 
                            ? 'Trending Down' 
                            : 'Stable'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">7-Day Average</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeMetric === 'bloodPressure' 
                        ? `${Math.round(records.reduce((sum, r) => sum + r.bloodPressure.systolic, 0) / records.length)}/${Math.round(records.reduce((sum, r) => sum + r.bloodPressure.diastolic, 0) / records.length)}` 
                        : activeMetric === 'heartRate' 
                          ? Math.round(records.reduce((sum, r) => sum + r.heartRate, 0) / records.length) 
                          : activeMetric === 'weight' 
                            ? (records.reduce((sum, r) => sum + r.weight, 0) / records.length).toFixed(1) 
                            : activeMetric === 'sleepHours' 
                              ? (records.reduce((sum, r) => sum + r.sleepHours, 0) / records.length).toFixed(1) 
                              : Math.round(records.reduce((sum, r) => sum + r.steps, 0) / records.length).toLocaleString()}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {getMetricUnit(activeMetric)}
                      </span>
                    </p>
                  </div>
                  <div>
                    {activeMetric === 'heartRate' && <Heart className="h-10 w-10 text-red-400 opacity-50" />}
                    {activeMetric === 'bloodPressure' && <Activity className="h-10 w-10 text-blue-400 opacity-50" />}
                    {activeMetric === 'weight' && <BarChart2 className="h-10 w-10 text-purple-400 opacity-50" />}
                    {activeMetric === 'sleepHours' && <Calendar className="h-10 w-10 text-green-400 opacity-50" />}
                    {activeMetric === 'steps' && <Activity className="h-10 w-10 text-amber-400 opacity-50" />}
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Trend Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" fontSize={12} tickMargin={5} />
                    <YAxis fontSize={12} tickMargin={5} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={getMetricColor(activeMetric)} 
                      fill={getMetricColor(activeMetric)} 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
