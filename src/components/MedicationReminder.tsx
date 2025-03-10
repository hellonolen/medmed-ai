
import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Bell, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Reminder = {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  time: string;
  active: boolean;
  lastTaken?: string;
};

export const MedicationReminder = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('daily');
  const [newTime, setNewTime] = useState('09:00');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load reminders from localStorage when component mounts
  useEffect(() => {
    const savedReminders = localStorage.getItem('medicationReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('medicationReminders', JSON.stringify(reminders));
  }, [reminders]);

  // Check for reminders that need to be triggered
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach(reminder => {
        if (reminder.active && reminder.time === currentTime) {
          // In a real app, we'd need to check if the reminder has already been triggered today
          if (Notification.permission === 'granted') {
            new Notification(`Time to take ${reminder.medicationName}`, {
              body: `Dosage: ${reminder.dosage}`,
              icon: '/favicon.ico'
            });
          }
          
          toast({
            title: "Medication Reminder",
            description: `Time to take ${reminder.medicationName} (${reminder.dosage})`,
            duration: 10000,
          });
        }
      });
    };
    
    const interval = setInterval(checkReminders, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [reminders, toast]);

  const handleAddReminder = () => {
    if (!newMedication.trim()) {
      toast({
        title: "Error",
        description: "Please enter a medication name",
        variant: "destructive",
      });
      return;
    }
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      medicationName: newMedication,
      dosage: newDosage,
      frequency: newFrequency,
      time: newTime,
      active: true
    };
    
    setReminders([...reminders, newReminder]);
    
    // Request notification permission if not granted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Reset form
    setNewMedication('');
    setNewDosage('');
    setNewFrequency('daily');
    setNewTime('09:00');
    setIsDialogOpen(false);
    
    toast({
      title: "Reminder Added",
      description: `Reminder for ${newMedication} set for ${newTime}`,
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    
    toast({
      title: "Reminder Deleted",
      description: "Medication reminder has been removed",
    });
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, active: !reminder.active } : reminder
    ));
  };

  const handleTakeMedication = (id: string) => {
    const now = new Date();
    const timestamp = now.toLocaleString();
    
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, lastTaken: timestamp } : reminder
    ));
    
    toast({
      title: "Medication Taken",
      description: "We've recorded that you've taken this medication",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            <span>Medication Reminders</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <Plus className="h-4 w-4" />
                <span className="ml-1">Add New</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Medication Reminder</DialogTitle>
                <DialogDescription>
                  Set up a reminder for your medications.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="medication" className="text-right">
                    Medication
                  </Label>
                  <Input
                    id="medication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter medication name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dosage" className="text-right">
                    Dosage
                  </Label>
                  <Input
                    id="dosage"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="col-span-3"
                    placeholder="E.g. 1 tablet, 10mg"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frequency" className="text-right">
                    Frequency
                  </Label>
                  <Select
                    value={newFrequency}
                    onValueChange={setNewFrequency}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice_daily">Twice Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddReminder}>Add Reminder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No medication reminders set</p>
            <p className="text-sm mt-1">Add reminders to get notifications when it's time to take your medications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(reminder => (
              <div 
                key={reminder.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  reminder.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className={`font-medium ${!reminder.active && 'text-gray-400'}`}>
                      {reminder.medicationName}
                    </h4>
                    {reminder.lastTaken && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Taken
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${!reminder.active && 'text-gray-400'}`}>{reminder.dosage}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-xs ${!reminder.active ? 'text-gray-400' : 'text-primary'}`}>
                      {formatTime(reminder.time)} • {reminder.frequency.replace('_', ' ')}
                    </span>
                    {reminder.lastTaken && (
                      <span className="text-xs text-gray-500">
                        Last: {new Date(reminder.lastTaken).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleTakeMedication(reminder.id)}
                    title="Mark as taken"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={reminder.active}
                    onCheckedChange={() => handleToggleReminder(reminder.id)}
                    aria-label="Toggle reminder"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-gray-500 mt-2">Reminders are stored on your device and will trigger as long as the website is open.</p>
      </CardFooter>
    </Card>
  );
};
