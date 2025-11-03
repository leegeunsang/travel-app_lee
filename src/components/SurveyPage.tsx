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
        bgColor: "bg-gradient-to-br from-blue-50 to-cyan-100", 
        hoverColor: "hover:from-blue-100 hover:to-cyan-150",
        selectedColor: "bg-gradient-to-br from-blue-100 to-cyan-200"
      },
      { 
        text: "새로운 경험과 관광", 
        value: 1, 
        bgColor: "bg-gradient-to-br from-amber-50 to-orange-100", 
        hoverColor: "hover:from-amber-100 hover:to-orange-150",
        selectedColor: "bg-gradient-to-br from-amber-100 to-orange-200"
      },
      { 
        text: "활동적인 액티비티", 
        value: 2, 
        bgColor: "bg-gradient-to-br from-green-50 to-emerald-100", 
        hoverColor: "hover:from-green-100 hover:to-emerald-150",
        selectedColor: "bg-gradient-to-br from-green-100 to-emerald-200"
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
        bgColor: "bg-gradient-to-br from-violet-50 to-purple-100", 
        hoverColor: "hover:from-violet-100 hover:to-purple-150",
        selectedColor: "bg-gradient-to-br from-violet-100 to-purple-200"
      },
      { 
        text: "문화와 역사 탐방", 
        value: 1, 
        bgColor: "bg-gradient-to-br from-rose-50 to-pink-100", 
        hoverColor: "hover:from-rose-100 hover:to-pink-150",
        selectedColor: "bg-gradient-to-br from-rose-100 to-pink-200"
      },
      { 
        text: "스포츠나 야외 활동", 
        value: 2, 
        bgColor: "bg-gradient-to-br from-teal-50 to-cyan-100", 
        hoverColor: "hover:from-teal-100 hover:to-cyan-150",
        selectedColor: "bg-gradient-to-br from-teal-100 to-cyan-200"
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
        bgColor: "bg-gradient-to-br from-indigo-50 to-blue-100", 
        hoverColor: "hover:from-indigo-100 hover:to-blue-150",
        selectedColor: "bg-gradient-to-br from-indigo-100 to-blue-200"
      },
      { 
        text: "도심에 위치한 호텔", 
        value: 1, 
        bgColor: "bg-gradient-to-br from-orange-50 to-amber-100", 
        hoverColor: "hover:from-orange-100 hover:to-amber-150",
        selectedColor: "bg-gradient-to-br from-orange-100 to-amber-200"
      },
      { 
        text: "자연 속 펜션이나 캠핑", 
        value: 2, 
        bgColor: "bg-gradient-to-br from-lime-50 to-green-100", 
        hoverColor: "hover:from-lime-100 hover:to-green-150",
        selectedColor: "bg-gradient-to-br from-lime-100 to-green-200"
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
        bgColor: "bg-gradient-to-br from-purple-50 to-fuchsia-100", 
        hoverColor: "hover:from-purple-100 hover:to-fuchsia-150",
        selectedColor: "bg-gradient-to-br from-purple-100 to-fuchsia-200"
      },
      { 
        text: "명소 방문과 사진 촬영", 
        value: 1, 
        bgColor: "bg-gradient-to-br from-pink-50 to-rose-100", 
        hoverColor: "hover:from-pink-100 hover:to-rose-150",
        selectedColor: "bg-gradient-to-br from-pink-100 to-rose-200"
      },
      { 
        text: "짜릿한 체험과 도전", 
        value: 2, 
        bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100", 
        hoverColor: "hover:from-emerald-100 hover:to-teal-150",
        selectedColor: "bg-gradient-to-br from-emerald-100 to-teal-200"
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
        bgColor: "bg-gradient-to-br from-sky-50 to-blue-100", 
        hoverColor: "hover:from-sky-100 hover:to-blue-150",
        selectedColor: "bg-gradient-to-br from-sky-100 to-blue-200"
      },
      { 
        text: "주요 명소 위주로 계획적", 
        value: 1, 
        bgColor: "bg-gradient-to-br from-amber-50 to-yellow-100", 
        hoverColor: "hover:from-amber-100 hover:to-yellow-150",
        selectedColor: "bg-gradient-to-br from-amber-100 to-yellow-200"
      },
      { 
        text: "다양한 액티비티로 빡빡하게", 
        value: 2, 
        bgColor: "bg-gradient-to-br from-cyan-50 to-teal-100", 
        hoverColor: "hover:from-cyan-100 hover:to-teal-150",
        selectedColor: "bg-gradient-to-br from-cyan-100 to-teal-200"
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
      <div className="w-full max-w-[412px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 pt-6 pb-6">
          {/* Back Button */}
          <motion.button 
            onClick={onBack}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">돌아가기</span>
          </motion.button>

          {/* Title and Progress */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl text-white font-semibold">여행 성향 분석</h1>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <span className="text-white font-medium text-sm">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="bg-white h-2.5 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="px-6 pt-8 pb-6">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* White Card Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 shadow-2xl">
              {/* Question */}
              <h2 className="text-xl text-gray-900 mb-7 font-semibold leading-relaxed">
                {questions[currentQuestion].question}
              </h2>
              
              {/* Options */}
              <div className="space-y-5">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedOption === option.value;
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option.value)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                      className={`w-full min-h-[110px] px-6 py-8 flex items-center justify-center text-center rounded-2xl transition-all duration-200 border-2 ${
                        isSelected
                          ? `${option.selectedColor} border-transparent shadow-xl scale-[1.02]`
                          : `${option.bgColor} ${option.hoverColor} border-gray-100 shadow-lg`
                      }`}
                    >
                      <span className={`text-xl leading-relaxed ${isSelected ? 'font-semibold' : 'font-medium'} text-gray-900`}>
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
