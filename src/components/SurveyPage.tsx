import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: number;
    bgColor: string;
    hoverColor: string;
    selectedColor: string;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "여행 중 가장 중요한 것은?",
    options: [
      { 
        text: "휴식과 힐링", 
        value: 0, 
        bgColor: "bg-emerald-50", 
        hoverColor: "hover:bg-emerald-100",
        selectedColor: "bg-emerald-200"
      },
      { 
        text: "새로운 경험과 관광", 
        value: 1, 
        bgColor: "bg-blue-50", 
        hoverColor: "hover:bg-blue-100",
        selectedColor: "bg-blue-200"
      },
      { 
        text: "활동적인 액티비티", 
        value: 2, 
        bgColor: "bg-orange-50", 
        hoverColor: "hover:bg-orange-100",
        selectedColor: "bg-orange-200"
      }
    ]
  },
  {
    id: 2,
    question: "선호하는 여행 스타일은?",
    options: [
      { 
        text: "조용하고 편안한 휴양", 
        value: 0, 
        bgColor: "bg-emerald-50", 
        hoverColor: "hover:bg-emerald-100",
        selectedColor: "bg-emerald-200"
      },
      { 
        text: "문화와 역사 탐방", 
        value: 1, 
        bgColor: "bg-blue-50", 
        hoverColor: "hover:bg-blue-100",
        selectedColor: "bg-blue-200"
      },
      { 
        text: "스포츠나 야외 활동", 
        value: 2, 
        bgColor: "bg-orange-50", 
        hoverColor: "hover:bg-orange-100",
        selectedColor: "bg-orange-200"
      }
    ]
  },
  {
    id: 3,
    question: "여행지에서 어떤 숙소를 선호하시나요?",
    options: [
      { 
        text: "리조트나 스파 시설이 있는 곳", 
        value: 0, 
        bgColor: "bg-emerald-50", 
        hoverColor: "hover:bg-emerald-100",
        selectedColor: "bg-emerald-200"
      },
      { 
        text: "도심에 위치한 호텔", 
        value: 1, 
        bgColor: "bg-blue-50", 
        hoverColor: "hover:bg-blue-100",
        selectedColor: "bg-blue-200"
      },
      { 
        text: "자연 속 펜션이나 캠핑", 
        value: 2, 
        bgColor: "bg-orange-50", 
        hoverColor: "hover:bg-orange-100",
        selectedColor: "bg-orange-200"
      }
    ]
  },
  {
    id: 4,
    question: "여행에서 가장 기대되는 것은?",
    options: [
      { 
        text: "여유로운 시간과 충분한 휴식", 
        value: 0, 
        bgColor: "bg-emerald-50", 
        hoverColor: "hover:bg-emerald-100",
        selectedColor: "bg-emerald-200"
      },
      { 
        text: "명소 방문과 사진 촬영", 
        value: 1, 
        bgColor: "bg-blue-50", 
        hoverColor: "hover:bg-blue-100",
        selectedColor: "bg-blue-200"
      },
      { 
        text: "짜릿한 체험과 도전", 
        value: 2, 
        bgColor: "bg-orange-50", 
        hoverColor: "hover:bg-orange-100",
        selectedColor: "bg-orange-200"
      }
    ]
  },
  {
    id: 5,
    question: "여행 일정은 어떻게 짜는 편인가요?",
    options: [
      { 
        text: "여유롭게 느긋한 일정", 
        value: 0, 
        bgColor: "bg-emerald-50", 
        hoverColor: "hover:bg-emerald-100",
        selectedColor: "bg-emerald-200"
      },
      { 
        text: "주요 명소 위주로 계획적", 
        value: 1, 
        bgColor: "bg-blue-50", 
        hoverColor: "hover:bg-blue-100",
        selectedColor: "bg-blue-200"
      },
      { 
        text: "다양한 액티비티로 빡빡하게", 
        value: 2, 
        bgColor: "bg-orange-50", 
        hoverColor: "hover:bg-orange-100",
        selectedColor: "bg-orange-200"
      }
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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleAnswer = (value: number) => {
    setSelectedOption(value);
    
    setTimeout(() => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        // Decision Tree 로직: 가장 많이 선택된 값으로 성향 결정
        const counts = [0, 0, 0];
        newAnswers.forEach(ans => counts[ans]++);
        const maxIndex = counts.indexOf(Math.max(...counts));
        
        const styles = ["힐링", "관광", "액티비티"];
        onComplete(styles[maxIndex], newAnswers);
      }
    }, 300);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-gray-100 flex flex-col">
        {/* Status Bar */}
        <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-200">
          <span className="text-lg font-semibold text-black ml-2">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
            <div className="w-6 h-3 border-2 border-gray-900 rounded-sm relative ml-0.5">
              <div className="absolute right-0 top-0.5 bottom-0.5 w-3 h-1.5 bg-gray-900 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white px-6 pt-4 pb-4">
          {/* Back Button */}
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>

          {/* Title and Progress */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl text-gray-900">여행 성향 분석</h1>
            <span className="text-gray-500 text-sm">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 px-6 py-6 flex items-start">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* White Card Container */}
            <div className="bg-white rounded-3xl p-7 shadow-sm">
              {/* Question */}
              <h2 className="text-lg text-gray-900 mb-6">
                {questions[currentQuestion].question}
              </h2>
              
              {/* Options */}
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedOption === option.value;
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option.value)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full px-6 py-6 text-left rounded-2xl transition-all duration-200 border-2 shadow-sm ${
                        isSelected
                          ? `${option.selectedColor} border-transparent scale-[1.02]`
                          : `${option.bgColor} ${option.hoverColor} border-gray-100`
                      }`}
                    >
                      <span className={`text-base leading-relaxed ${isSelected ? 'font-medium' : ''} text-gray-900`}>
                        {option.text}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Help Text */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-gray-500">
                💡 답변을 선택하면 자동으로 다음 질문으로 넘어갑니다
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
