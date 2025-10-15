import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: number;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "여행 중 가장 중요한 것은?",
    options: [
      { text: "휴식과 힐링", value: 0 },
      { text: "새로운 경험과 관광", value: 1 },
      { text: "활동적인 액티비티", value: 2 }
    ]
  },
  {
    id: 2,
    question: "선호하는 여행 스타일은?",
    options: [
      { text: "조용하고 편안한 휴양", value: 0 },
      { text: "문화와 역사 탐방", value: 1 },
      { text: "스포츠나 야외 활동", value: 2 }
    ]
  },
  {
    id: 3,
    question: "여행지에서 어떤 숙소를 선호하시나요?",
    options: [
      { text: "리조트나 스파 시설이 있는 곳", value: 0 },
      { text: "도심에 위치한 호텔", value: 1 },
      { text: "자연 속 펜션이나 캠핑", value: 2 }
    ]
  },
  {
    id: 4,
    question: "여행에서 가장 기대되는 것은?",
    options: [
      { text: "여유로운 시간과 충분한 휴식", value: 0 },
      { text: "명소 방문과 사진 촬영", value: 1 },
      { text: "짜릿한 체험과 도전", value: 2 }
    ]
  },
  {
    id: 5,
    question: "여행 일정은 어떻게 짜는 편인가요?",
    options: [
      { text: "여유롭게 느긋한 일정", value: 0 },
      { text: "주요 명소 위주로 계획적", value: 1 },
      { text: "다양한 액티비티로 빡빡하게", value: 2 }
    ]
  }
];

interface SurveyPageProps {
  onComplete: (travelStyle: string, answers: number[]) => void;
  onBack: () => void;
}

export function SurveyPage({ onComplete, onBack }: SurveyPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Decision Tree 로직: 가장 많이 선택된 값으로 성향 결정
      const counts = [0, 0, 0];
      newAnswers.forEach(ans => counts[ans]++);
      const maxIndex = counts.indexOf(Math.max(...counts));
      
      const styles = ["힐링", "관광", "액티비티"];
      onComplete(styles[maxIndex], newAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-gradient-to-b from-blue-50 to-white min-h-screen pb-20 px-6 shadow-xl">
        <div className="pt-8">
        <button onClick={onBack} className="mb-6 text-gray-600">
          ← 돌아가기
        </button>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl">여행 성향 분석</h1>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-6">
          <h2 className="mb-6">
            {questions[currentQuestion].question}
          </h2>
          
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                {option.text}
              </button>
            ))}
          </div>
        </Card>

        {currentQuestion > 0 && (
          <Button
            onClick={() => {
              setCurrentQuestion(currentQuestion - 1);
              setAnswers(answers.slice(0, -1));
            }}
            variant="outline"
            className="w-full mt-4"
          >
            이전 질문
          </Button>
        )}
        </div>
      </div>
    </div>
  );
}
