import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, Share, Download, BookOpen } from "lucide-react";
import { getTest, getTestQuestions } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  questionIndex: number;
  type: 'MCQ' | 'TF' | 'SHORT' | 'LONG';
  prompt: string;
  options: string[];
  correctAnswer: { selected: number } | { value: string };
  points: number;
  rubric?: any;
}

interface Test {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  settings: any;
  createdAt: string;
  updatedAt: string;
}

const Builder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestData = async () => {
      if (!id) {
        setError('ID verifica mancante');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [testData, questionsData] = await Promise.all([
          getTest(id),
          getTestQuestions(id)
        ]);
        
        setTest(testData);
        setQuestions(questionsData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading test:', err);
        setError(err.message || 'Errore durante il caricamento della verifica');
        toast({
          title: "Errore",
          description: err.message || 'Errore durante il caricamento della verifica',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTestData();
  }, [id, toast]);

  const handleGoBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    toast({
      title: "Verifica salvata",
      description: "Le modifiche sono state salvate con successo",
    });
  };

  const handleAddQuestion = () => {
    toast({
      title: "Funzionalità in sviluppo",
      description: "L'aggiunta di nuove domande sarà disponibile presto",
    });
  };

  const handlePublish = () => {
    toast({
      title: "Funzionalità in sviluppo", 
      description: "La pubblicazione sarà disponibile presto",
    });
  };

  const selectedQuestion = questions[selectedQuestionIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl qg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Caricamento verifica...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-destructive mb-4">
            <h2 className="text-xl font-semibold mb-2">Errore</h2>
            <p>{error}</p>
          </div>
          <Button onClick={handleGoBack} variant="outline">
            Torna alla Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Verifica non trovata</h2>
          <Button onClick={handleGoBack} variant="outline">
            Torna alla Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla Home
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">{test.title}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={test.status === 'DRAFT' ? 'secondary' : 'default'}>
                    {test.status === 'DRAFT' ? 'Bozza' : test.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {questions.length} {questions.length === 1 ? 'domanda' : 'domande'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salva
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi domanda
              </Button>
              <Button variant="outline" size="sm" onClick={handlePublish}>
                <Share className="w-4 h-4 mr-2" />
                Pubblica
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Esporta
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Questions Index */}
          <div className="lg:col-span-3">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Domande</h3>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedQuestionIndex === index
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Domanda {index + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {question.type}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-75 mt-1 truncate">
                      {question.prompt.substring(0, 50)}...
                    </p>
                    <p className="text-xs opacity-60 mt-1">
                      {question.points} {question.points === 1 ? 'punto' : 'punti'}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-6">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Domanda {selectedQuestionIndex + 1}
                  </h3>
                  <Badge variant="outline">{selectedQuestion.type}</Badge>
                </div>
              </div>

              <div className="space-y-6">
                {/* Question Prompt */}
                <div>
                  <Label htmlFor="prompt">Testo della domanda</Label>
                  <Textarea
                    id="prompt"
                    value={selectedQuestion.prompt}
                    placeholder="Inserisci il testo della domanda..."
                    className="mt-2 min-h-[100px]"
                    readOnly
                  />
                </div>

                {/* Question Options (for MCQ) */}
                {selectedQuestion.type === 'MCQ' && (
                  <div>
                    <Label>Opzioni</Label>
                    <div className="mt-2 space-y-3">
                      <RadioGroup 
                        value={('selected' in selectedQuestion.correctAnswer) ? selectedQuestion.correctAnswer.selected?.toString() : ''} 
                        className="space-y-3"
                      >
                        {selectedQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <RadioGroupItem 
                              value={index.toString()} 
                              id={`option-${index}`}
                              disabled
                            />
                            <Input
                              value={option}
                              placeholder={`Opzione ${index + 1}`}
                              className="flex-1"
                              readOnly
                            />
                            {('selected' in selectedQuestion.correctAnswer) && selectedQuestion.correctAnswer.selected === index && (
                              <Badge variant="default" className="text-xs">
                                Corretta
                              </Badge>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {/* Question Points */}
                <div>
                  <Label htmlFor="points">Punti</Label>
                  <Input
                    id="points"
                    type="number"
                    value={selectedQuestion.points}
                    min="1"
                    max="100"
                    className="mt-2 w-24"
                    readOnly
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Question Properties */}
          <div className="lg:col-span-3">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Proprietà</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Tipo</Label>
                  <Badge variant="outline" className="mt-1 block w-fit">
                    {selectedQuestion.type === 'MCQ' ? 'Scelta multipla' :
                     selectedQuestion.type === 'TF' ? 'Vero/Falso' :
                     selectedQuestion.type === 'SHORT' ? 'Risposta breve' :
                     'Risposta lunga'}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm">Punteggio</Label>
                  <p className="text-lg font-semibold mt-1">
                    {selectedQuestion.points} {selectedQuestion.points === 1 ? 'punto' : 'punti'}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Modalità demo - Le modifiche non verranno salvate
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;