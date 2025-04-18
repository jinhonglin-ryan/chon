import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector.tsx';
import './PersonalityTest.css';

type IdentityType = 'mother' | 'corporate' | 'both' | 'other';
type TestStep = 'intro' | 'identity' | 'privacy' | 'questionnaire';
type QuestionType = 'multiple-choice' | 'text-input' | 'scale-question';
type QuestionnaireType = 'mother' | 'corporate' | 'other';

interface Question {
  id: number;
  type: QuestionType;
  textEn: string;
  textZh: string;
  options?: {
    id: string;
    textEn: string;
    textZh: string;
  }[];
  scaleLabels?: {
    minEn: string;
    minZh: string;
    maxEn: string; 
    maxZh: string;
  };
  tags?: string[];
}

interface PersonalityTestProps {
  onWhiteThemeChange?: (isWhite: boolean) => void;
  onHideUIChange?: (shouldHide: boolean) => void;
}

// Create a context interface for questionnaires
interface QuestionnaireContext {
  type: QuestionnaireType;
  totalQuestions: number;
  questions: Question[];
  privacyStatement?: {
    titleEn: string;
    titleZh: string;
    contentEn: string;
    contentZh: string;
  };
}

// MetaTags Component for Mobile Optimization
const MetaTags = () => {
  React.useEffect(() => {
    // Ensure the viewport meta tag is set correctly for this page
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Cleanup function to restore the original meta tag when component unmounts
    return () => {
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);
  
  return null;
};

const PersonalityTest = ({ onWhiteThemeChange, onHideUIChange }: PersonalityTestProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate(); // 添加导航钩子
  const [step, setStep] = useState<TestStep>('intro');
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [selectedIdentities, setSelectedIdentities] = useState<Set<IdentityType>>(new Set());
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFirstPage, setShowFirstPage] = useState(true);
  const [showSecondPage, setShowSecondPage] = useState(false);
  const [showThirdPage, setShowThirdPage] = useState(false);
  const [showFourthPage, setShowFourthPage] = useState(false);
  const [showFifthPage, setShowFifthPage] = useState(false);
  // 移除不再需要的页面状态变量
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [agreePercentage, setAgreePercentage] = useState<number>(65);
  // Add state to track current questionnaire type
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<QuestionnaireType | null>(null);
  // Add state to track secondary questionnaire for "both" option
  const [secondaryQuestionnaire, setSecondaryQuestionnaire] = useState<QuestionnaireType | null>(null);
  // Add state to track if we're showing the primary or secondary questionnaire
  const [showingPrimaryQuestionnaire, setShowingPrimaryQuestionnaire] = useState(true);
  // Add state to track primary answers separately from secondary
  const [primaryAnswers, setPrimaryAnswers] = useState<Record<number, string>>({});
  const [secondaryAnswers, setSecondaryAnswers] = useState<Record<number, string>>({});
  // 添加标签得分计算相关的状态
  const [tagScores, setTagScores] = useState<Record<string, number[]>>({});
  
  // Define questionnaire collections
  const questionnaires: Record<QuestionnaireType, QuestionnaireContext> = {
    mother: {
      type: 'mother',
      totalQuestions: 48,
      questions: [
    {
      id: 1,
      type: 'multiple-choice',
      textEn: 'How many children do you have or are expecting to have?',
      textZh: '您有或预计有多少个孩子？',
      options: [
        { id: 'A', textEn: '1', textZh: '1 个' },
        { id: 'B', textEn: '2', textZh: '2 个' },
        { id: 'C', textEn: '3', textZh: '3 个' },
        { id: 'D', textEn: '4 or more', textZh: '4 个或更多' },
      ]
    },
    {
      id: 2,
      type: 'text-input',
      textEn: 'Which hospital did you use for prenatal care services?',
      textZh: '您在哪家医院进行了产检服务？',
    },
    {
      id: 3,
      type: 'multiple-choice',
      textEn: 'How many trimesters did you experience noticeable morning sickness?',
      textZh: '您经历了几个妊娠期有明显的孕吐反应？',
      options: [
        { id: 'A', textEn: 'None', textZh: '无' },
        { id: 'B', textEn: '1 trimester', textZh: '1个妊娠期' },
        { id: 'C', textEn: '2 trimesters', textZh: '2个妊娠期' },
        { id: 'D', textEn: 'Entire pregnancy', textZh: '整个孕期' },
      ]
    },
    {
      id: 4,
      type: 'text-input',
      textEn: 'What was your youngest child\'s birth weight?',
      textZh: '您第一胎宝宝的出生体重是多少？',
    },
    {
      id: 5,
      type: 'multiple-choice',
      textEn: 'How long was your maternity leave?',
      textZh: '您的产假有多长时间？',
      options: [
        { id: 'A', textEn: 'Less than 1 month', textZh: '少于 1 个月' },
        { id: 'B', textEn: '1-3 months', textZh: '1-3 个月' },
        { id: 'C', textEn: '3-6 months', textZh: '3-6 个月' },
        { id: 'D', textEn: 'More than 6 months', textZh: '6 个月以上' },
      ]
    },
    {
      id: 6,
      type: 'multiple-choice',
      textEn: 'Did you receive postpartum care or stay at a postpartum center?',
      textZh: '您是否接受了产后护理或入住了月子中心？',
      options: [
        { id: 'A', textEn: 'Yes', textZh: '是' },
        { id: 'B', textEn: 'No', textZh: '否' },
      ]
    },
    {
      id: 7,
      type: 'text-input',
      textEn: 'How would you describe your postpartum emotions in ten words?',
      textZh: '您能用十个词形容您的产后状态吗？',
    },
    {
      id: 8,
      type: 'text-input',
      textEn: 'How would you describe your motherhood experience in ten words?',
      textZh: '您能用十个词形容您作为母亲的状态吗？',
    },
    {
      id: 9,
      type: 'scale-question',
      textEn: 'How involved do you feel you are with your previous social life from work after pregnancy?',
      textZh: '您觉得怀孕后自己与以往工作的社交联系程度如何？',
      scaleLabels: {
        minEn: 'Not involved at all',
        minZh: '完全未参与',
        maxEn: 'Very involved',
        maxZh: '非常投入'
      },
      tags: ['社交情商']
    },
    {
      id: 10,
      type: 'scale-question',
      textEn: 'How well does your work arrangement after pregnancy support your needs as a working mother?',
      textZh: '您怀孕后的工作安排对作为职场母亲的您有多大支持作用？',
      scaleLabels: {
        minEn: 'Not supportive at all',
        minZh: '完全不支持',
        maxEn: 'Extremely supportive',
        maxZh: '非常支持'
      },
    },
    {
      id: 11,
      type: 'scale-question',
      textEn: 'How connected do you feel to your professional identity since becoming a mother?',
      textZh: '自成为母亲后，您对自己的职业身份感有多强？',
      scaleLabels: {
        minEn: 'Not connected – motherhood is full priority',
        minZh: '完全不强 – 母亲角色优先',
        maxEn: 'Very connected – profession is important',
        maxZh: '非常强 – 职业身份很重要'
      },
      tags: ['自我意识']
    },
    {
      id: 12,
      type: 'scale-question',
      textEn: 'How has motherhood impacted your career progression or promotion opportunities?',
      textZh: '母亲身份对您的职业发展或晋升机会有何影响？',
      scaleLabels: {
        minEn: 'Very negative – significantly hindered',
        minZh: '非常负面 – 明显阻碍',
        maxEn: 'Very positive – enhanced opportunities',
        maxZh: '非常积极 – 提升机会'
      }
    },
    {
      id: 13,
      type: 'scale-question',
      textEn: 'How capable are you with the current support your employer provides in balancing work and motherhood?',
      textZh: '您如何评价您运用公司提供的兼顾工作和育儿的支持的能力？',
      scaleLabels: {
        minEn: 'Not capable of being supported',
        minZh: '完全不能被支持',
        maxEn: 'Extremely supported',
        maxZh: '非常能被支持'
      },
      tags: ['自我意识']
    },
    {
      id: 14,
      type: 'scale-question',
      textEn: 'How has motherhood influenced your leadership or management style at work?',
      textZh: '母亲身份如何影响了您在工作中的领导或管理风格？',
      scaleLabels: {
        minEn: 'Negative – worse at communication',
        minZh: '消极影响 – 降低沟通能力',
        maxEn: 'Positive – better at communication',
        maxZh: '积极影响 – 提升沟通能力'
      },
      tags: ['情绪调节']
    },
    {
      id: 15,
      type: 'scale-question',
      textEn: 'How effective are you at managing work-related stress since becoming a mother?',
      textZh: '自成为母亲后，您应对工作压力的能力如何？',
      scaleLabels: {
        minEn: 'Much less – harder to manage stress now',
        minZh: '更低效 – 更难应对压力',
        maxEn: 'Much more – strengthened my resilience',
        maxZh: '更有效 – 增强了韧性'
      },
      tags: ['核心耐力', '情绪调节']
    },
    {
      id: 16,
      type: 'scale-question',
      textEn: 'How motivated do you feel to pursue career growth since becoming a mother?',
      textZh: '自成为母亲后，您在职业发展方面的动力有多强？',
      scaleLabels: {
        minEn: 'Not motivated at all',
        minZh: '完全没有',
        maxEn: 'Very motivated',
        maxZh: '非常强'
      },
      tags: ['核心耐力']
    },
    {
      id: 17,
      type: 'scale-question',
      textEn: 'How would your satisfaction level with your ability to maintain work-life balance be?',
      textZh: '您对您目前工作与生活平衡的能力感到满意吗？',
      scaleLabels: {
        minEn: 'Very dissatisfied',
        minZh: '非常不满意',
        maxEn: 'Very satisfied',
        maxZh: '非常满意'
      },
      tags: ['自我意识']
    },
    {
      id: 18,
      type: 'scale-question',
      textEn: 'How often do you feel your needs as a mother are taken into account during important workplace decisions?',
      textZh: '在重要的职场决策中，您觉得作为职场母亲的需求被考虑的频率如何？',
      scaleLabels: {
        minEn: 'Never – completely overlooked',
        minZh: '从未 – 完全未被考虑',
        maxEn: 'Always – consistently considered',
        maxZh: '总是 – 经常被考虑'
      },
      tags: ['自我意识']
    },
    {
      id: 19,
      type: 'scale-question',
      textEn: 'How connected do you feel with other mothers through your work?',
      textZh: '您在工作中与其他母亲的联系如何？',
      scaleLabels: {
        minEn: 'Very disconnected — no connection',
        minZh: '非常弱 – 没有联系',
        maxEn: 'Very connected – strong networks',
        maxZh: '非常强 – 紧密网络'
      },
      tags: ['社交情商']
    },
    {
      id: 20,
      type: 'scale-question',
      textEn: 'Are you actively seeking more opportunities to connect with other mothers through your profession?',
      textZh: '您是否主动在工作中寻求更多与其他职场母亲建立联系的机会？',
      scaleLabels: {
        minEn: 'Never',
        minZh: '从不',
        maxEn: 'Always',
        maxZh: '经常'
      },
      tags: ['社交情商']
    },
    {
      id: 21,
      type: 'multiple-choice',
      textEn: 'If you were the god or goddess of the business world and could change or create one thing from the following, what would it be?',
      textZh: '如果您是商业世界的创造神，并且可以创造或改变以下任何一件事，您会改变什么？',
      options: [
        { id: 'A', textEn: 'Redistribute corporate shares so that every individual owns a piece of every business', textZh: '重新分配公司股份，让每个人都能在每家企业中分一杯羹' },
        { id: 'B', textEn: 'Create 72 versions of yourself, each mastering a different industry', textZh: '创造72个化身，每个精通一个不同的行业' },
        { id: 'C', textEn: 'Transform into an omnipotent prophet that oversees and predicts moves of everyone in the business world', textZh: '化身为全知预言家，精准观测并预测商业世界中每个人的行动' },
        { id: 'D', textEn: 'Imbue every product of my organization with divine allure, making it irresistible to all', textZh: '赋予我的企业所有产品神圣吸引力，让所有人都无法抗拒' },
        { id: 'E', textEn: 'Reconstruct the entire economic system to achieve absolute perfection and sustainability', textZh: '重塑所有经济体系，实现绝对完美与可持续发展' },
        { id: 'F', textEn: 'Ensure that no matter what happens, my organization always stays ahead and outmaneuvers my competitors', textZh: '确保无论发生什么，我的企业始终超越我的竞争对手' }
      ],
    },
    {
      id: 22,
      type: 'scale-question',
      textEn: 'How well do you think enhanced abstract logical thinking would address emotional and life concerns?',
      textZh: '您认为加强抽象逻辑思维对解决情感和生活问题有多大帮助？',
      scaleLabels: {
        minEn: 'Not well - No link with emotions',
        minZh: '完全不行 – 毫无关系',
        maxEn: 'Extremely well - Very effective',
        maxZh: '非常好 – 极其有效'
      },
      tags: ['客观能力', '情绪调节']
    },
    {
      id: 23,
      type: 'scale-question',
      textEn: 'To what extent do you believe that true self-love and the ability to care for others require strong objective reasoning to navigate challenges in life?',
      textZh: '你认为真正的自爱和关爱他人的能力在多大程度上需要强大的客观思维来解决生活中的挑战？',
      scaleLabels: {
        minEn: 'Strongly disagree',
        minZh: '非常不同意',
        maxEn: 'Strongly agree',
        maxZh: '非常同意'
      },
    },
    {
      id: 24,
      type: 'scale-question',
      textEn: 'How valuable do you find having a professional page within the app to showcase your previous work?',
      textZh: '您觉得在应用内拥有一个用于展示以往工作的职业页面有多大价值？',
      scaleLabels: {
        minEn: 'Not valuable at all',
        minZh: '完全没有价值',
        maxEn: 'Extremely valuable',
        maxZh: '非常有价值'
      },
      tags: ['自我意识']
    },
    {
      id: 25,
      type: 'scale-question',
      textEn: 'How likely are you to use this app to share completed projects or achievements for deal sourcing or client acquisition?',
      textZh: '您有多大可能使用该应用分享完成的商业项目或工作成就，以寻找合作机会或获取客户？',
      scaleLabels: {
        minEn: 'Very unlikely',
        minZh: '完全不可能',
        maxEn: 'Very likely',
        maxZh: '非常可能'
      },
      tags: ['客观能力']
    },
    {
      id: 26,
      type: 'scale-question',
      textEn: 'How valuable would you find a feature that helps you to stay updated with trends and knowledge in their professional field?',
      textZh: '您认为一个帮助职场母亲了解其行业领域最新动态的功能有多大用处？',
      scaleLabels: {
        minEn: 'Not valuable',
        minZh: '毫无价值 – 毫无益处',
        maxEn: 'Extremely valuable',
        maxZh: '极具价值 – 职业发展必备'
      },
      tags: ['奉献精神']
    },
    {
      id: 27,
      type: 'scale-question',
      textEn: 'How likely are you to use the forum to connect with other mothers for emotional or medical support?',
      textZh: '您有多大可能使用该论坛与其他母亲建立联系，获取情感或医疗方面的支持？',
      scaleLabels: {
        minEn: 'Very unlikely',
        minZh: '完全不可能',
        maxEn: 'Very likely',
        maxZh: '非常可能'
      },
      tags: ['社交情商']
    },
    {
      id: 28,
      type: 'scale-question',
      textEn: 'How valuable do you think this forum could be in helping you feel less isolated as a working mother?',
      textZh: '您认为该论坛在帮助您增进作为职场母亲与别人连接方面有多大价值？',
      scaleLabels: {
        minEn: 'Not valuable at all',
        minZh: '完全没有价值',
        maxEn: 'Extremely valuable',
        maxZh: '非常有价值'
      },
      tags: ['自我意识', '社交情商']
    },
    {
      id: 29,
      type: 'scale-question',
      textEn: 'How motivated are you to use visuospatial and logical training modules within the app to strengthen abstract cognitive skills?',
      textZh: '您有多大动力使用应用内的视觉空间和逻辑训练模块？',
      scaleLabels: {
        minEn: 'Not motivated at all',
        minZh: '完全没有动力',
        maxEn: 'Very motivated',
        maxZh: '非常有动力'
      },
      tags: ['客观能力']
    },
    {
      id: 30,
      type: 'scale-question',
      textEn: 'How helpful do you think cognitive training would be in enhancing your problem-solving abilities?',
      textZh: '您认为抽象逻辑训练对提升您解决问题的能力有多大帮助？',
      scaleLabels: {
        minEn: 'Not helpful at all',
        minZh: '完全无帮助',
        maxEn: 'Extremely helpful',
        maxZh: '非常有帮助'
      },
      tags: ['客观能力']
    },
    {
      id: 31,
      type: 'scale-question',
      textEn: 'How engaging do you think it would be to create and interact with a self-designed electronic child avatar in your personal profile?',
      textZh: '您觉得在个人主页中创建并与自定义的"电子小孩"虚拟形象互动的这个功能有多大吸引力？',
      scaleLabels: {
        minEn: 'Not engaging at all',
        minZh: '完全无吸引力',
        maxEn: 'Very engaging',
        maxZh: '非常有吸引力'
      },
      tags: ['社交情商']
    },
    {
      id: 32,
      type: 'scale-question',
      textEn: 'How would you evaluate a company-specific AI model offering work-related productivity features for you and other mothers?',
      textZh: '您如何看待一个专门为每家公司定制的职场母亲专用人工智能模型？',
      scaleLabels: {
        minEn: 'Not valuable – completely unnecessary',
        minZh: '毫无必要 – 完全不需要',
        maxEn: 'Extremely helpful – enhances efficiency',
        maxZh: '极具价值 – 提升效率'
      },
      tags: ['客观能力']
    },
    {
      id: 33,
      type: 'scale-question',
      textEn: 'How do you feel about requiring you to submit a confidential child health-related record to verify that you and other users are active caregivers?',
      textZh: '您如何看待要求您在使用本应用程序之前提交与儿童健康相关的保密记录，以证实您是孩子的照顾者？',
      scaleLabels: {
        minEn: 'Strongly oppose – utterly invasive',
        minZh: '强烈反对 - 违反隐私',
        maxEn: 'Strongly support – ensures safety and trust',
        maxZh: '强烈支持 - 保障安全的基础'
      },
      tags: ['客观能力']
    },
    {
      id: 34,
      type: 'scale-question',
      textEn: 'Do you believe misuse by unintended users (including your partner accessing accounts without permission) could negatively affect trust in the app?',
      textZh: '您认为如果有非目标用户滥用该平台（包括您的生活伴侣未经允许访问账户等情况），是否会对用户对本应用的信任度产生负面影响？',
      scaleLabels: {
        minEn: 'Definitely no – no trust risk',
        minZh: '绝对不 – 完全无风险',
        maxEn: 'Definitely yes – severely undermines trust',
        maxZh: '绝对会 – 严重破坏信任'
      },
    },
    {
      id: 35,
      type: 'scale-question',
      textEn: 'How do you feel about your company occasionally verifying through HR that business updates and activities posted on this platform are genuinely by yourself and other mother users, not others misusing their accounts?',
      textZh: '您如何看待由公司人力资源部门核查平台上的业务更新和动态确实由目标用户本人发布，而非他人滥用账户？',
      scaleLabels: {
        minEn: 'Strongly oppose',
        minZh: '强烈反对',
        maxEn: 'Strongly support',
        maxZh: '强烈支持'
      },
      tags: ['自我意识']
    },
    {
      id: 36,
      type: 'scale-question',
      textEn: 'How important are empathy, compassion, and selflessness associated with motherhood in leadership and life?',
      textZh: '您认为母亲体现出的同理心、关爱与无私，对成功的领导力和人生有多重要？',
      scaleLabels: {
        minEn: 'Not important at all',
        minZh: '完全不重要',
        maxEn: 'Extremely important',
        maxZh: '极其重要'
      },
      tags: ['社交情商']
    },
    {
      id: 37,
      type: 'scale-question',
      textEn: 'How important are resilience and perseverance associated with motherhood in leadership and life?',
      textZh: '您认为母亲展现出的韧性和毅力对成功的领导力和人生有多重要？',
      scaleLabels: {
        minEn: 'Not important at all',
        minZh: '完全不重要',
        maxEn: 'Extremely important',
        maxZh: '极其重要'
      },
      tags: ['核心耐力']
    },
    {
      id: 38,
      type: 'scale-question',
      textEn: 'How valuable are communication and listening associated with motherhood in leadership and life?',
      textZh: '您认为母亲身上的沟通与倾听能力对成功的领导力和人生有多重要？',
      scaleLabels: {
        minEn: 'Not valuable at all',
        minZh: '完全不重要',
        maxEn: 'Extremely important',
        maxZh: '极其重要'
      },
      tags: ['社交情商']
    },
    {
      id: 39,
      type: 'scale-question',
      textEn: 'How crucial are responsibility and accountability associated with motherhood in leadership and life?',
      textZh: '您认为母亲身上的责任感和担当对成功的领导力和人生有多重要？',
      scaleLabels: {
        minEn: 'Not important at all',
        minZh: '完全不重要',
        maxEn: 'Extremely important',
        maxZh: '极其重要'
      },
      tags: ['奉献精神']
    },
    {
      id: 40,
      type: 'scale-question',
      textEn: 'How prepared did you feel for motherhood before becoming a mother?',
      textZh: '在成为母亲之前，您觉得自己对母亲这一角色的准备程度如何？',
      scaleLabels: {
        minEn: 'Not prepared at all',
        minZh: '完全没有准备',
        maxEn: 'Very prepared',
        maxZh: '非常充分'
      },
      tags: ['核心耐力']
    },
    {
      id: 41,
      type: 'scale-question',
      textEn: 'How much has motherhood changed your personal values or priorities?',
      textZh: '母亲身份对您的个人价值观或人生优先事项改变有多大？',
      scaleLabels: {
        minEn: 'No change',
        minZh: '没有改变',
        maxEn: 'Completely',
        maxZh: '完全改变'
      },
      tags: ['自我意识']
    },
    {
      id: 42,
      type: 'scale-question',
      textEn: 'How supported do you feel by your family or community in your motherhood journey?',
      textZh: '在做母亲的过程中，您觉得家人或社群对您的支持程度如何？',
      scaleLabels: {
        minEn: 'Not supported at all',
        minZh: '完全没有支持',
        maxEn: 'Extremely supported',
        maxZh: '非常支持'
      },
      tags: ['社交情商']
    },
    {
      id: 43,
      type: 'scale-question',
      textEn: 'How much emotional fulfillment has motherhood brought to your life?',
      textZh: '母亲身份为您的生活带来了多少情感满足感？',
      scaleLabels: {
        minEn: 'No emotion at all',
        minZh: '完全没有情感',
        maxEn: 'Extremely fulfilling',
        maxZh: '非常满足'
      },
      tags: ['奉献精神']
    },
    {
      id: 44,
      type: 'scale-question',
      textEn: 'How much do you feel that motherhood has made you more resilient or emotionally strong?',
      textZh: '母亲身份是否让您变得更有韧性或情绪更强大？',
      scaleLabels: {
        minEn: 'Much weaker',
        minZh: '明显减弱',
        maxEn: 'Much stronger',
        maxZh: '显著增强'
      },
      tags: ['情绪调节', '核心耐力']
    },
    {
      id: 45,
      type: 'scale-question',
      textEn: 'How has motherhood affected your ability to set boundaries (e.g., with work, family, or friends) in life?',
      textZh: '母亲身份对您设定边界（如与工作、家庭或朋友）能力的影响如何？',
      scaleLabels: {
        minEn: 'Significantly weakened',
        minZh: '显著减弱',
        maxEn: 'Improved greatly',
        maxZh: '显著提升'
      },
      tags: ['自我意识']
    },
    {
      id: 46,
      type: 'scale-question',
      textEn: 'How often do you feel pressure to meet external expectations of motherhood (e.g., societal, cultural, or family expectations)?',
      textZh: '您多久感受到来自外界对母亲角色（如社会、文化或家庭）的期待压力？',
      scaleLabels: {
        minEn: 'Never',
        minZh: '从不',
        maxEn: 'Always',
        maxZh: '总是'
      },
      tags: ['自我意识']
    },
    {
      id: 47,
      type: 'scale-question',
      textEn: 'How satisfied are you with the balance between your motherhood role and your sense of self outside of being a mother?',
      textZh: '您对自己平衡母亲这一身份与作为母亲之外的自我身份有多满意？',
      scaleLabels: {
        minEn: 'Very dissatisfied',
        minZh: '非常不满意',
        maxEn: 'Very satisfied',
        maxZh: '非常满意'
      },
      tags: ['自我意识']
    },
    {
      id: 48,
      type: 'scale-question',
      textEn: 'How much do you feel that your own mother\'s role influenced your early understanding of leadership or responsibility?',
      textZh: '您认为您的母亲在多大程度上影响了童年时期您对领导力或责任感的认知？',
      scaleLabels: {
        minEn: 'Not at all',
        minZh: '没有影响',
        maxEn: 'Very strongly',
        maxZh: '非常深远'
      },
      tags: ['自我意识']
    },
      ],
      privacyStatement: {
        titleEn: 'Privacy Statement',
        titleZh: '隐私声明',
        contentEn: 'Your information will only be used for verification purposes and to formulate your CHON personality test. It will not be shared, disclosed, or used for any other purpose. We are committed to protecting your privacy and ensuring the security of your data.',
        contentZh: '您的信息将仅用于验证目的和制定您的 CHON 性格测试。您的信息不会被共享、披露或用于任何其他目的。我们重视您的隐私，并承诺保护您的数据安全。'
      }
    },
    corporate: {
      type: 'corporate',
      totalQuestions: 47,
      questions: [
        {
          id: 1,
          type: 'text-input',
          textEn: 'What is your current / most recent job position?',
          textZh: '您目前的职位名称是什么？',
        },
        {
          id: 2,
          type: 'text-input',
          textEn: 'What is your professional contact (e.g., email, LinkedIn)?',
          textZh: '请问您的职业联系方式是什么（例如：邮箱、领英）？',
        },
        {
          id: 3,
          type: 'text-input',
          textEn: 'Which industry or business sector does your company operate in?',
          textZh: '贵公司属于哪个行业或业务领域？',
        },
        {
          id: 4,
          type: 'multiple-choice',
          textEn: 'How many years of experience do you have in a managerial or leadership role?',
          textZh: '您在管理或领导岗位上有多少年的工作经验？',
          options: [
            { id: 'A', textEn: 'Less than 1 year', textZh: '不到1年' },
            { id: 'B', textEn: '1-3 years', textZh: '1-3年' },
            { id: 'C', textEn: '3-5 years', textZh: '3-5年' },
            { id: 'D', textEn: '5-10 years', textZh: '5-10年' },
            { id: 'E', textEn: 'More than 10 years', textZh: '10年以上' }
          ]
        },
        {
          id: 5,
          type: 'multiple-choice',
          textEn: 'What is the approximate size of your direct span of control?',
          textZh: '您的直接管理团队规模是多少？',
          options: [
            { id: 'A', textEn: 'No direct reports', textZh: '没有直接下属' },
            { id: 'B', textEn: '1-5 people', textZh: '1-5人' },
            { id: 'C', textEn: '6-15 people', textZh: '6-15人' },
            { id: 'D', textEn: '16-30 people', textZh: '16-30人' },
            { id: 'E', textEn: 'More than 30 people', textZh: '30人以上' }
          ]
        },
        {
          id: 6,
          type: 'multiple-choice',
          textEn: 'What is the approximate size of your indirect span of control?',
          textZh: '您简介管理多少人？',
          options: [
            { id: 'A', textEn: 'No indirect reports', textZh: '没有间接下属' },
            { id: 'B', textEn: '1-10 people', textZh: '1-10人' },
            { id: 'C', textEn: '11-50 people', textZh: '11-50人' },
            { id: 'D', textEn: '51-200 people', textZh: '51-200人' },
            { id: 'E', textEn: 'More than 200 people', textZh: '200人以上' }
          ]
        },
        {
          id: 7,
          type: 'text-input',
          textEn: 'How would you describe the overall reporting structure look like within your team in ten words?',
          textZh: '请在十字以内描述您团队中的整体报告结构',
        },
        {
          id: 8,
          type: 'scale-question',
          textEn: 'How would you describe the decision-making structure in your organization?',
          textZh: '您如何描述贵公司决策体系的运作方式？',
          scaleLabels: {
            minEn: 'Highly centralized',
            minZh: '高度集中化',
            maxEn: 'Flexibly adaptive',
            maxZh: '灵活变通'
          },
        },
        {
          id: 9,
          type: 'scale-question',
          textEn: 'In your opinion, what should be the primary basis of decision-making authority in your organization?',
          textZh: '在您看来，贵司的决策权应该主要基于什么？',
          scaleLabels: {
            minEn: 'Rigid policies & Top-down command',
            minZh: '严格的政策和自上而下的指挥',
            maxEn: 'Entirely based on individual\'s ability',
            maxZh: '完全基于个人能力'
          },
          tags: ['客观能力']
        },
        {
          id: 10,
          type: 'scale-question',
          textEn: 'How well-organized would you say your team structure is under your leadership?',
          textZh: '您认为在您的领导下，您的团队结构有多有序和高效？',
          scaleLabels: {
            minEn: 'Not organized',
            minZh: '缺乏组织性',
            maxEn: 'Very well-organized',
            maxZh: '组织性非常强'
          },
          tags: ['客观能力', '核心耐力']
        },
        {
          id: 11,
          type: 'scale-question',
          textEn: 'How would you rate your team\'s level of communication and collaboration under your leadership?',
          textZh: '您认为在您的领导下，您的团队的沟通与协作水平如何？',
          scaleLabels: {
            minEn: 'Very poor – Lack communication & efficiency',
            minZh: '非常差 — 缺乏沟通和效率',
            maxEn: 'Excellent – Great communication & efficiency',
            maxZh: '非常好 — 极好的沟通和效率'
          },
          tags: ['客观能力', '社交情商']
        },
        {
          id: 12,
          type: 'scale-question',
          textEn: 'How would you rate your experience in communicating and establishing trust with clients or business partners?',
          textZh: '您如何评价自己在与客户或业务伙伴沟通及建立信任方面的经验？',
          scaleLabels: {
            minEn: 'Very poor – significant challenges',
            minZh: '非常差 – 极大挑战',
            maxEn: 'Excellent – effective and trusted',
            maxZh: '非常好 – 有效、可信'
          },
          tags: ['社交情商']
        },
        {
          id: 13,
          type: 'scale-question',
          textEn: 'How effective do you believe your organization is at understanding client or market needs?',
          textZh: '您认为贵司在理解客户或市场需求方面的效果如何？',
          scaleLabels: {
            minEn: 'Very poor – insufficient understanding',
            minZh: '非常差 – 不充分了解',
            maxEn: 'Excellent – exceeds expectations',
            maxZh: '非常好 – 超出预期'
          },
          tags: ['社交情商']
        },
        {
          id: 14,
          type: 'scale-question',
          textEn: 'How important do you think responsibility is in building successful business projects?',
          textZh: '您认为责任感对商业项目的成功有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['客观能力', '奉献精神']
        },
        {
          id: 15,
          type: 'scale-question',
          textEn: 'How important do you think empathy and communication are in building successful business relationships?',
          textZh: '您认为同理心和沟通能力在建立成功的商业关系中有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['奉献精神', '社交情商']
        },
        {
          id: 16,
          type: 'scale-question',
          textEn: 'How would you describe the current recognition and utilization of the "soft skills" of kindness, responsibility, empathy, and communication in your company?',
          textZh: '您如何描述贵司目前对软实力（善良、责任心、同理心、沟通能力）的认可和使用情况？',
          scaleLabels: {
            minEn: 'Not recognized at all',
            minZh: '完全不认可',
            maxEn: 'Highly recognized and utilized',
            maxZh: '高度认可和利用'
          },
          tags: ['奉献精神']
        },
        {
          id: 17,
          type: 'scale-question',
          textEn: 'Do you think men and women are equally supported in your industry when it comes to balancing work and family?',
          textZh: '在您的行业中, 您认为男性和女性是否在平衡工作与家庭方面得到了同等支持？',
          scaleLabels: {
            minEn: 'No, one is significantly less supported',
            minZh: '不是，其一得到的很少同等支持',
            maxEn: 'Yes, equally supported',
            maxZh: '是的，两种性别都得到了平等支持'
          },
          tags: ['自我意识']
        },
        {
          id: 18,
          type: 'scale-question',
          textEn: 'In your opinion, how important is it for your organization to provide resources in the form of support and social bonding for working mothers?',
          textZh: '在您看来，公司为职场母亲提供情感支持和社交的资源有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Very important',
            maxZh: '非常重要'
          },
          tags: ['奉献精神']
        },
        {
          id: 19,
          type: 'scale-question',
          textEn: 'How would you describe your organization\'s current approach to supporting working mothers under your leadership?',
          textZh: '您如何描述贵司在您的领导下目前对职场母亲的支持程度？',
          scaleLabels: {
            minEn: 'Not supportive at all',
            minZh: '完全不支持',
            maxEn: 'Highly supportive with clear policies and resources',
            maxZh: '高度支持，有明确的政策和资源'
          },
          tags: ['奉献精神']
        },
        {
          id: 20,
          type: 'scale-question',
          textEn: 'How effectively do you use technology to support collaboration and productivity within your team?',
          textZh: '您在团队协作和生产力提升方面对科技的使用程度如何？',
          scaleLabels: {
            minEn: 'Not at all',
            minZh: '完全不使用',
            maxEn: 'Very effectively',
            maxZh: '非常有效地使用'
          },
          tags: ['客观能力']
        },
        {
          id: 21,
          type: 'multiple-choice',
          textEn: 'If you were the god or goddess of the business world and could change or create one thing from the following, what would it be?',
          textZh: '如果您是商业世界的创造神，并且可以创造或改变以下任何一件事，您会选择什么？',
          options: [
            { id: 'A', textEn: 'Redistribute all corporate shares so that every individual owns a piece of every business', textZh: '重新分配公司股份，让每个人都能在每家企业中分一杯羹' },
            { id: 'B', textEn: 'Create 72 versions of yourself, each mastering a different industry', textZh: '创造72个化身，每个精通一个不同的行业' },
            { id: 'C', textEn: 'Transform into an omnipotent prophet that oversees and predicts moves of everyone in the business world', textZh: '化身为全知预言家，精准观测并预测商业世界中每个人的行动' },
            { id: 'D', textEn: 'Imbue every product with divine allure, making it irresistible to all', textZh: '赋予所有产品神圣吸引力，让所有人都无法抗拒' },
            { id: 'E', textEn: 'Reconstruct the entire economic system to achieve absolute perfection and sustainability', textZh: '重塑所有经济体系，实现绝对完美与可持续发展' },
            { id: 'F', textEn: 'Ensure that no matter what happens, my business always stays ahead and outmaneuvers my competitors', textZh: '确保无论发生什么，我的企业始终超越我的竞争对手' }
          ],
        },
        {
          id: 22,
          type: 'scale-question',
          textEn: 'How well do you think enhanced abstract logical thinking would address emotional and life concerns?',
          textZh: '您认为加强抽象逻辑思维对解决情感和生活问题有多大帮助？',
          scaleLabels: {
            minEn: 'Not well - no link with emotions',
            minZh: '完全不行 – 毫无关系',
            maxEn: 'Extremely well - very effective',
            maxZh: '非常好 – 极其有效'
          },
          tags: ['客观能力', '情绪调节']
        },
        {
          id: 23,
          type: 'scale-question',
          textEn: 'To what extent do you believe that true self-love and the ability to care for others require strong objective reasoning to navigate challenges in life?',
          textZh: '你认为真正的自爱和关爱他人的能力在多大程度上需要强大的客观思维来解决生活中的挑战？',
          scaleLabels: {
            minEn: 'Strongly disagree',
            minZh: '非常不同意',
            maxEn: 'Strongly agree',
            maxZh: '非常同意'
          },
          tags: ['客观能力']
        },
        {
          id: 24,
          type: 'scale-question',
          textEn: 'How valuable would you find a feature that helps working mothers stay updated with trends and knowledge in their professional field?',
          textZh: '您认为一个帮助职场母亲了解其行业领域最新动态的功能有多大用处？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值 – 毫无益处',
            maxEn: 'Extremely valuable',
            maxZh: '极具价值 – 职业发展必备'
          },
          tags: ['奉献精神']
        },
        {
          id: 25,
          type: 'scale-question',
          textEn: 'How valuable would a business opportunity board be, where working mothers on your team could post or access new projects and deals?',
          textZh: '您认为一个帮助职场母亲发布和获取商业交易和商业合作的功能有多大用处？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值 – 完全不需要',
            maxEn: 'Highly valuable',
            maxZh: '极具价值 – 大幅提升发展'
          },
          tags: ['奉献精神']
        },
        {
          id: 26,
          type: 'scale-question',
          textEn: 'How do you perceive the value of a forum where mothers can share maternal experiences and emotional support?',
          textZh: '您认为一个帮助职场母亲分享育儿经验、获得情感支持的论坛有多大用处？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值 – 完全不需要',
            maxEn: 'Extremely beneficial',
            maxZh: '极其有益 – 非常重要的连接'
          },
          tags: ['奉献精神']
        },
        {
          id: 27,
          type: 'scale-question',
          textEn: 'How valuable would direct access to external healthcare professionals for medical advice be within such an app?',
          textZh: '您认为提供联系外部医疗专业人士获得医学建议的功能有多大用处？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值 – 完全不需要',
            maxEn: 'Extremely valuable',
            maxZh: '极具价值 – 健康必备'
          },
          tags: ['奉献精神']
        },
        {
          id: 28,
          type: 'scale-question',
          textEn: 'How beneficial would visuospatial and abstract logical training modules be for enhancing cognitive development?',
          textZh: '您认为视觉空间与数学逻辑训练模块对抽象逻辑发展有多大用处？',
          scaleLabels: {
            minEn: 'Not beneficial',
            minZh: '毫无价值 – 完全不需要',
            maxEn: 'Extremely beneficial',
            maxZh: '极具价值 – 提升效率'
          },
          tags: ['客观能力']
        },
        {
          id: 29,
          type: 'scale-question',
          textEn: 'How engaging do you think personalized profiles with interactive "electronic kids" avatars would be for promoting social interaction among working mothers?',
          textZh: '您认为通过个人主页中使用"电子小孩"互动来促进职场母亲之间社交互动的功能有多大用处？',
          scaleLabels: {
            minEn: 'Not engaging',
            minZh: '毫无价值 – 完全不需要',
            maxEn: 'Very engaging',
            maxZh: '极具价值 – 促进人性化连接'
          },
          tags: ['社交情商']
        },
        {
          id: 30,
          type: 'scale-question',
          textEn: 'How important would you find mentorship matching that connects new mothers with more experienced mothers within the same company or industry?',
          textZh: '您认为一个将新晋母亲与同一公司或行业内有更多育儿经验的母亲相匹配的功能有多大用处？',
          scaleLabels: {
            minEn: 'Not important',
            minZh: '毫无价值 – 完全不需要',
            maxEn: 'Extremely important',
            maxZh: '极具价值 – 促进人性化连接'
          },
          tags: ['社交情商']
        },
        {
          id: 31,
          type: 'scale-question',
          textEn: 'How would you evaluate a company-specific AI model offering work-related productivity features for working mothers?',
          textZh: '您如何看待一个专门为每家公司定制的职场母亲专用人工智能模型？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无必要 – 完全不需要',
            maxEn: 'Extremely helpful',
            maxZh: '极具价值 – 提升效率'
          },
          tags: ['奉献精神']
        },
        {
          id: 32,
          type: 'scale-question',
          textEn: 'How do you see the role of AI technology evolving to support working parents in the next 5–10 years?',
          textZh: '您如何看待未来5–10年内，人工智能在职场父母方面的角色？',
          scaleLabels: {
            minEn: 'AI brings new challenges ahead',
            minZh: '带来全新挑战',
            maxEn: 'AI revolutionizes support for parents',
            maxZh: '革新对父母的支持'
          },
          tags: ['客观能力']
        },
        {
          id: 33,
          type: 'scale-question',
          textEn: 'In your mind, how could an app that incorporates motherhood also serve as a tool for improving client relationships, customer satisfaction, or deal development?',
          textZh: '在您看来，一款引进母亲这一身份的应用程序如何同时成为改善客户关系、提高客户满意度或促进交易发展的工具？',
          scaleLabels: {
            minEn: 'Not beneficial',
            minZh: '没有好处',
            maxEn: 'Extremely beneficial',
            maxZh: '非常有益'
          },
          tags: ['情绪调节']
        },
        {
          id: 34,
          type: 'scale-question',
          textEn: 'How do you feel about requiring users to submit a confidential child health-related record to verify that they are active caregivers while using this app?',
          textZh: '您如何看待要求用户在使用本应用程序的某些功能之前提交与儿童健康相关的保密记录，以证实她们是儿童的母亲？',
          scaleLabels: {
            minEn: 'Strongly oppose – utterly invasive',
            minZh: '强烈反对 – 违反隐私',
            maxEn: 'Strongly support – ensures safety and trust',
            maxZh: '强烈支持 – 保障安全的基础'
          },
          tags: ['客观能力']
        },
        {
          id: 35,
          type: 'scale-question',
          textEn: 'Do you believe misuse by unintended users (including partners of pregnant women and mothers accessing accounts without permission) could negatively affect trust in the app?',
          textZh: '您是否认为非目标用户的滥用（包括未经许可访问账户的孕妇和母亲的伴侣）可能会对应用的信任产生负面影响？',
          scaleLabels: {
            minEn: 'Definitely no – no trust risk',
            minZh: '绝对不 – 完全无风险',
            maxEn: 'Definitely yes – severely undermines trust',
            maxZh: '绝对会 – 严重破坏信任'
          },
          tags: ['客观能力']
        },
        {
          id: 36,
          type: 'scale-question',
          textEn: 'How do you feel about companies verifying through HR that business updates and activities posted on this platform are genuinely from the intended mother users and not others misusing their accounts?',
          textZh: '您如何看待由公司人力资源部门核查平台上的业务更新和动态确实由目标用户本人发布，而非他人滥用账户？',
          scaleLabels: {
            minEn: 'Strongly oppose',
            minZh: '强烈反对',
            maxEn: 'Strongly support',
            maxZh: '强烈支持'
          },
          tags: ['自我意识']
        },
        {
          id: 37,
          type: 'scale-question',
          textEn: 'How important are empathy, compassion, and selflessness associated with motherhood in leadership and life?',
          textZh: '您认为母亲体现出的同理心、关爱与无私，对成功的领导力和人生有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['社交情商']
        },
        {
          id: 38,
          type: 'scale-question',
          textEn: 'How important are resilience and perseverance associated with motherhood in leadership and life?',
          textZh: '您认为母亲展现出的韧性和毅力对成功的领导力和人生有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['核心耐力']
        },
        {
          id: 39,
          type: 'scale-question',
          textEn: 'How valuable are communication and listening associated with motherhood in leadership and life?',
          textZh: '您认为母亲身上的沟通与倾听能力对成功的领导力和人生有多重要？',
          scaleLabels: {
            minEn: 'Not valuable at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['社交情商']
        },
        {
          id: 40,
          type: 'scale-question',
          textEn: 'How crucial are responsibility and accountability associated with motherhood in leadership and life?',
          textZh: '您认为母亲身上的责任感和担当对成功的领导力和人生有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['客观能力', '奉献精神']
        },
        {
          id: 41,
          type: 'scale-question',
          textEn: 'Have you personally resolved challenges balancing leadership responsibilities with parenting (or caregiving)?',
          textZh: '您是否曾面临平衡领导责任与育儿（或照护他人）之间的挑战？',
          scaleLabels: {
            minEn: 'Never',
            minZh: '从未',
            maxEn: 'Yes, frequently',
            maxZh: '经常'
          },
          tags: ['客观能力', '核心耐力']
        },
        {
          id: 42,
          type: 'scale-question',
          textEn: 'How much has becoming a parent (or caregiver) influenced your leadership style?',
          textZh: '成为父母（或照护者）对您的领导风格有多大影响？',
          scaleLabels: {
            minEn: 'No influence',
            minZh: '没有影响',
            maxEn: 'Significantly changed it for the better',
            maxZh: '有显著的积极改变'
          },
          tags: ['奉献精神']
        },
        {
          id: 43,
          type: 'scale-question',
          textEn: 'How do you believe motherhood impacts leadership effectiveness in the workplace?',
          textZh: '您认为引进母亲这一身份如何影响职场中的领导效果？',
          scaleLabels: {
            minEn: 'Negatively',
            minZh: '消极影响',
            maxEn: 'Positively',
            maxZh: '积极影响'
          },
          tags: ['奉献精神']
        },
        {
          id: 44,
          type: 'scale-question',
          textEn: 'How well does your organization integrate leadership traits developed through motherhood into its talent and leadership pipeline?',
          textZh: '您认为贵公司是否在人才培养和领导梯队中，重视并融合了母亲所带来的领导力特质？',
          scaleLabels: {
            minEn: 'Poorly',
            minZh: '不太重视 — 从不考虑',
            maxEn: 'Very well',
            maxZh: '非常重视 — 积极整合并推广'
          },
          tags: ['奉献精神']
        },
        {
          id: 45,
          type: 'scale-question',
          textEn: 'How much do you pay attention to the emotional well-being of working mothers around you, especially considering potential scenarios like hormonal changes or postpartum depression?',
          textZh: '您在多大程度上关注身边职场母亲的情绪状态，特别是受到激素变化或产后抑郁等挑战的影响时？',
          scaleLabels: {
            minEn: 'Not at all – I don\'t pay attention to this',
            minZh: '完全不关注 – 不曾留意',
            maxEn: 'Very much – I actively offer support',
            maxZh: '非常关注 – 会主动提供支持'
          },
          tags: ['社交情商']
        },
        {
          id: 46,
          type: 'scale-question',
          textEn: 'How equipped do you feel to recognize when a mother employee might be experiencing emotional difficulties due to life transitions (e.g., childbirth, parenting stress)?',
          textZh: '您认为自己在识别职场母亲因生活转变（如生育、育儿压力）而产生情绪困难方面的能力如何？',
          scaleLabels: {
            minEn: 'Not equipped at all – I never consider this',
            minZh: '完全没有能力 – 从未考虑',
            maxEn: 'Very equipped – I can identify and address it appropriately',
            maxZh: '非常有能力 – 能妥善应对'
          },
          tags: ['情绪调节']
        },
        {
          id: 47,
          type: 'scale-question',
          textEn: 'How much do you feel that your mother\'s role influenced your early understanding of leadership or responsibility?',
          textZh: '您认为您的母亲在多大程度上影响了童年时期您对领导力、责任感、同理心的认知？',
          scaleLabels: {
            minEn: 'Not at all',
            minZh: '没有影响',
            maxEn: 'Very strongly',
            maxZh: '非常深远'
          },
          tags: ['自我意识']
        }
      ],
      privacyStatement: {
        titleEn: 'Privacy Statement',
        titleZh: '隐私声明',
        contentEn: 'Your information will only be used for verification purposes and to formulate your CHON personality test. It will not be shared, disclosed, or used for any other purpose. We are committed to protecting your privacy and ensuring the security of your data.',
        contentZh: '您的信息将仅用于验证目的和制定您的 CHON 性格测试。您的信息不会被共享、披露或用于任何其他目的。我们重视您的隐私，并承诺保护您的数据安全。'
      }
    },
    other: {
      type: 'other',
      totalQuestions: 37, // Updated to reflect the actual number of questions
      questions: [
        // About Professional Work 部分
        {
          id: 1,
          type: 'scale-question',
          textEn: 'How supportive is your current company or team in fostering both professional growth and overall well-being?',
          textZh: '您认为您所在的组织或团队在支持职业发展和身心健康双方面表现如何？',
          scaleLabels: {
            minEn: 'Not supportive at all',
            minZh: '完全不重视',
            maxEn: 'Very supportive',
            maxZh: '非常重视'
          },
          tags: ['自我意识']
        },
        {
          id: 2,
          type: 'scale-question',
          textEn: 'How much opportunity do you have to build meaningful professional relationships within your organization?',
          textZh: '您在组织或团队内建立有意义的合作关系的机会有多少？',
          scaleLabels: {
            minEn: 'None – mostly isolated interactions',
            minZh: '没有 – 多为孤立互动',
            maxEn: 'A lot – strong connections',
            maxZh: '很多 – 多为良好关系'
          },
          tags: ['社交情商']
        },
        {
          id: 3,
          type: 'scale-question',
          textEn: 'How important do you find emotional intelligence and soft skills (e.g., empathy, patience, communication, active listening) in your day-to-day collaboration with colleagues?',
          textZh: '您觉得在日常协作中，情绪智慧和软实力（如同理心、耐心、倾听）有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极为重要'
          },
          tags: ['社交情商', '奉献精神']
        },
        {
          id: 4,
          type: 'scale-question',
          textEn: 'How frequently do you experience acts of kindness or supportive behavior in your team or company culture?',
          textZh: '您在团队中感受到来自同事的善意或支持行为有多频繁？',
          scaleLabels: {
            minEn: 'Never',
            minZh: '从未',
            maxEn: 'Very frequently',
            maxZh: '非常频繁'
          },
          tags: ['奉献精神']
        },
        {
          id: 5,
          type: 'scale-question',
          textEn: 'How would you describe your role in terms of providing support or care to colleagues during team interactions or projects?',
          textZh: '在团队合作或项目推进中，您通常会在多大程度上给予同事支持或关心？',
          scaleLabels: {
            minEn: 'Do not engage in offering support',
            minZh: '基本不提供支持',
            maxEn: 'Frequently offer support',
            maxZh: '经常主动给予支持'
          },
          tags: ['奉献精神']
        },
        {
          id: 6,
          type: 'scale-question',
          textEn: 'How much do you feel your contributions and perspectives are recognized and valued by your team?',
          textZh: '您觉得自己在团队中的意见和贡献被认可的程度如何？',
          scaleLabels: {
            minEn: 'Never',
            minZh: '几乎从未被采纳',
            maxEn: 'Always',
            maxZh: '总是被重视并采纳'
          },
          tags: ['自我意识']
        },
        {
          id: 7,
          type: 'scale-question',
          textEn: 'To what extent does your organization promote a culture of collaboration built on trust and mutual respect?',
          textZh: '您认为团队在营造基于信任与相互尊重的合作氛围方面做得如何？',
          scaleLabels: {
            minEn: 'Does not at all',
            minZh: '几乎没有相关文化',
            maxEn: 'Strongly across all levels',
            maxZh: '做得非常好，深入人心'
          },
          tags: ['客观能力', '奉献精神']
        },
        {
          id: 8,
          type: 'scale-question',
          textEn: 'How comfortable are you with reaching out to colleagues or managers when facing challenges or seeking help?',
          textZh: '面对困难或需要帮助时，您与同事或上级沟通的舒适度如何？',
          scaleLabels: {
            minEn: 'Very uncomfortable',
            minZh: '很不愿意',
            maxEn: 'Very comfortable',
            maxZh: '非常自然'
          },
          tags: ['社交情商', '情绪调节']
        },
        {
          id: 9,
          type: 'scale-question',
          textEn: 'How important do you think a people-centered work culture is for maintaining both productivity and team morale?',
          textZh: '您觉得以人为本的企业文化对保持工作效率和团队凝聚力的重要性如何？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '几乎不重要',
            maxEn: 'Extremely important',
            maxZh: '非常重要'
          },
          tags: ['社交情商']
        },
        {
          id: 10,
          type: 'scale-question',
          textEn: 'How often do you feel that a sense of belonging or team care positively impacts your motivation and job satisfaction?',
          textZh: '您怎么描述您因团队归属感或同事关怀提升工作积极性和满意度的频率？',
          scaleLabels: {
            minEn: 'Never',
            minZh: '从未，无影响',
            maxEn: 'Very often',
            maxZh: '经常，重要动力'
          },
          tags: ['情绪调节']
        },
        {
          id: 11,
          type: 'scale-question',
          textEn: 'What role does technology (e.g., collaboration tools, productivity apps) play in helping your team stay efficient and connected?',
          textZh: '您认为技术工具（如协作平台、生产力应用）在提升团队效率与保持联系方面的作用如何？',
          scaleLabels: {
            minEn: 'No role',
            minZh: '基本无作用',
            maxEn: 'A critical role',
            maxZh: '至关重要'
          },
          tags: ['客观能力']
        },
        // About Us 部分
        {
          id: 12,
          type: 'scale-question',
          textEn: 'How well do you think enhanced abstract logical thinking would address emotional and life concerns?',
          textZh: '您认为加强抽象逻辑思维对解决情感和生活问题有多大帮助？',
          scaleLabels: {
            minEn: 'Not well - no link with emotions',
            minZh: '完全不行 – 毫无关系',
            maxEn: 'Extremely well - very effective',
            maxZh: '非常好 – 极其有效'
          },
          tags: ['客观能力', '情绪调节']
        },
        {
          id: 13,
          type: 'scale-question',
          textEn: 'To what extent do you believe that true self-love and the ability to care for others require strong objective reasoning to navigate challenges in life?',
          textZh: '你认为真正的自爱和关爱他人的能力在多大程度上需要强大的客观思维来解决生活中的挑战？',
          scaleLabels: {
            minEn: 'Strongly disagree',
            minZh: '非常不同意',
            maxEn: 'Strongly agree',
            maxZh: '非常同意'
          },
          tags: ['客观能力']
        },
        {
          id: 14,
          type: 'scale-question',
          textEn: 'How valuable would you find a feature that helps working mothers in your team stay updated with trends and knowledge in their professional field?',
          textZh: '您认为一个帮助职场母亲了解其行业领域最新动态的功能有多大用处？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值',
            maxEn: 'Extremely valuable',
            maxZh: '非常有价值'
          },
          tags: ['奉献精神']
        },
        {
          id: 15,
          type: 'scale-question',
          textEn: 'How valuable would a business opportunity board be, where working mothers on your team could post or access new projects and deals?',
          textZh: '您认为一个可以让团队中的职场母亲发布或获取新项目和商业机会的平台有多大价值？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值',
            maxEn: 'Highly valuable',
            maxZh: '非常有价值'
          },
          tags: ['客观能力']
        },
        {
          id: 16,
          type: 'scale-question',
          textEn: 'How do you perceive the value of a forum where mothers can share maternal experiences and emotional support?',
          textZh: '您如何看待一个让母亲们分享育儿经验和情感支持的论坛的价值？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值',
            maxEn: 'Extremely beneficial',
            maxZh: '非常有价值'
          },
          tags: ['奉献精神']
        },
        {
          id: 17,
          type: 'scale-question',
          textEn: 'How valuable would direct access to external healthcare professionals for medical advice be within such an app?',
          textZh: '您认为在应用内直接联系外部医疗专业人士获取建议的功能有多大价值？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值',
            maxEn: 'Extremely valuable',
            maxZh: '非常有价值'
          },
          tags: ['奉献精神']
        },
        {
          id: 18,
          type: 'scale-question',
          textEn: 'How beneficial would visuospatial and abstract logical training modules be for enhancing cognitive development?',
          textZh: '您认为视觉空间和抽象逻辑训练模块对提升认知发展有多大好处？',
          scaleLabels: {
            minEn: 'Not beneficial',
            minZh: '没有好处',
            maxEn: 'Extremely beneficial',
            maxZh: '非常有益'
          },
          tags: ['客观能力']
        },
        {
          id: 19,
          type: 'scale-question',
          textEn: 'How engaging do you think personalized profiles with interactive "electronic kids" avatars would be for promoting social interaction among working mothers?',
          textZh: '您认为带有互动"电子小孩"头像的个性化档案对促进职场母亲之间的社交互动有多大吸引力？',
          scaleLabels: {
            minEn: 'Not engaging',
            minZh: '毫无吸引力',
            maxEn: 'Very engaging',
            maxZh: '非常有吸引力'
          },
          tags: ['社交情商']
        },
        {
          id: 20,
          type: 'scale-question',
          textEn: 'How important would you find mentorship matching that connects new mothers with more experienced mothers within the same company or industry?',
          textZh: '您认为将新手母亲与同公司或行业中更有经验的母亲配对的导师计划有多重要？',
          scaleLabels: {
            minEn: 'Not important',
            minZh: '不重要',
            maxEn: 'Extremely important',
            maxZh: '非常重要'
          },
          tags: ['社交情商']
        },
        {
          id: 21,
          type: 'scale-question',
          textEn: 'How would you evaluate a company-specific AI model offering work-related productivity features for working mothers?',
          textZh: '您如何评价一个为职场母亲提供工作相关生产力功能的公司专用AI模型？',
          scaleLabels: {
            minEn: 'Not valuable',
            minZh: '毫无价值',
            maxEn: 'Extremely helpful',
            maxZh: '非常有帮助'
          },
          tags: ['奉献精神']
        },
        {
          id: 22,
          type: 'scale-question',
          textEn: 'How do you see the role of AI technology evolving to support working parents in the next 5–10 years?',
          textZh: '您如何看待AI技术在未来5-10年内支持职场父母的演变？',
          scaleLabels: {
            minEn: 'AI brings new challenges ahead',
            minZh: 'AI带来新的挑战',
            maxEn: 'AI revolutionizes support for parents',
            maxZh: 'AI将彻底革新对父母的支持'
          },
          tags: ['客观能力']
        },
        {
          id: 23,
          type: 'scale-question',
          textEn: 'In your mind, how could an app that incorporates motherhood also serve as a tool for improving client relationships, customer satisfaction, or deal development?',
          textZh: '在您看来，一个融合母亲身份特点的应用如何作为改善客户关系、提高顾客满意度或促进交易发展的工具？',
          scaleLabels: {
            minEn: 'Not beneficial',
            minZh: '没有好处',
            maxEn: 'Extremely beneficial',
            maxZh: '非常有益'
          },
          tags: ['情绪调节']
        },
        {
          id: 24,
          type: 'scale-question',
          textEn: 'How do you feel about requiring users to submit a confidential child health-related record to verify that they are active caregivers before using this app?',
          textZh: '您对要求用户提交保密的儿童健康相关记录以验证他们是活跃的照顾者才能使用此应用的看法如何？',
          scaleLabels: {
            minEn: 'Strongly oppose – utterly invasive',
            minZh: '强烈反对 – 完全侵犯隐私',
            maxEn: 'Strongly support – ensures safety and trust',
            maxZh: '强烈支持 – 确保安全和信任'
          },
          tags: ['客观能力']
        },
        {
          id: 25,
          type: 'scale-question',
          textEn: 'Do you believe misuse by unintended users (including partners of pregnant women and mothers accessing accounts without permission) could negatively affect trust in the app?',
          textZh: '您是否认为非目标用户的滥用（包括未经许可访问账户的孕妇和母亲的伴侣）可能会对应用的信任度产生负面影响？',
          scaleLabels: {
            minEn: 'Definitely no – no trust risk',
            minZh: '绝对不会 – 没有信任风险',
            maxEn: 'Definitely yes – severely undermines trust',
            maxZh: '绝对会 – 严重损害信任'
          },
          tags: ['客观能力']
        },
        {
          id: 26,
          type: 'scale-question',
          textEn: 'How do you feel about companies verifying through HR that business updates and activities posted on this platform are genuinely from the intended mother users and not others misusing their accounts?',
          textZh: '您对公司通过人力资源部验证此平台上发布的业务更新和活动确实来自目标母亲用户而非其他人滥用其账户的看法如何？',
          scaleLabels: {
            minEn: 'Strongly oppose',
            minZh: '强烈反对',
            maxEn: 'Strongly support',
            maxZh: '强烈支持'
          },
          tags: ['自我意识']
        },
        // About Motherhood 部分
        {
          id: 27,
          type: 'scale-question',
          textEn: 'How important are empathy, compassion, and selflessness associated with motherhood in work and life?',
          textZh: '您认为母亲常体现出的同理心、关爱与无私，对成功的工作和人生有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['社交情商']
        },
        {
          id: 28,
          type: 'scale-question',
          textEn: 'How important are resilience and perseverance associated with motherhood in work and life?',
          textZh: '您认为母亲展现出的韧性和毅力对成功的工作和人生有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely important',
            maxZh: '极其重要'
          },
          tags: ['核心耐力']
        },
        {
          id: 29,
          type: 'scale-question',
          textEn: 'How valuable are communication and listening associated with motherhood in work and life?',
          textZh: '您认为母亲身上的沟通与倾听能力对成功的工作和人生有多重要？',
          scaleLabels: {
            minEn: 'Not valuable at all',
            minZh: '完全不重要',
            maxEn: 'Extremely valuable',
            maxZh: '极其重要'
          },
          tags: ['社交情商']
        },
        {
          id: 30,
          type: 'scale-question',
          textEn: 'How crucial are responsibility and accountability associated with motherhood in work and life?',
          textZh: '您认为母亲身上的责任感和担当对成功的工作和人生有多重要？',
          scaleLabels: {
            minEn: 'Not important at all',
            minZh: '完全不重要',
            maxEn: 'Extremely crucial',
            maxZh: '极其重要'
          },
          tags: ['客观能力', '奉献精神']
        },
        {
          id: 31,
          type: 'scale-question',
          textEn: 'Have you personally resolved challenges balancing leadership responsibilities with caregiving?',
          textZh: '您是否曾面临平衡领导责任与照护他人之间的挑战？',
          scaleLabels: {
            minEn: 'Never',
            minZh: '从未',
            maxEn: 'Yes, frequently',
            maxZh: '是的，经常'
          },
          tags: ['客观能力', '核心耐力']
        },
        {
          id: 32,
          type: 'scale-question',
          textEn: 'How much has becoming a caregiver of any kind influenced your work style?',
          textZh: '成为照护他人的人对您的工作处事风格有多大影响？',
          scaleLabels: {
            minEn: 'Negative impact',
            minZh: '消极影响',
            maxEn: 'Significantly improved',
            maxZh: '积极改变'
          },
          tags: ['奉献精神']
        },
        {
          id: 33,
          type: 'scale-question',
          textEn: 'How do you believe motherhood impacts leadership effectiveness in the workplace?',
          textZh: '您认为母亲身份如何影响职场中的领导效果？',
          scaleLabels: {
            minEn: 'Negatively',
            minZh: '消极影响',
            maxEn: 'Positively',
            maxZh: '积极影响'
          },
          tags: ['奉献精神']
        },
        {
          id: 34,
          type: 'scale-question',
          textEn: 'How well does your organization integrate leadership traits developed through motherhood into its talent and leadership pipeline?',
          textZh: '您认为您所在的公司是否在人才培养和领导梯队中，重视并融合了母亲所带来的领导力特质？',
          scaleLabels: {
            minEn: 'Poorly – rarely or never considers them',
            minZh: '不太重视 —— 很少或从不考虑',
            maxEn: 'Very well – actively integrates and promotes',
            maxZh: '非常重视 —— 积极整合并推广'
          },
          tags: ['奉献精神']
        },
        {
          id: 35,
          type: 'scale-question',
          textEn: 'How much do you pay attention to the emotional well-being of working mothers around you, especially considering potential scenarios like hormonal changes or postpartum depression?',
          textZh: '您在多大程度上关注身边职场母亲的情绪状态，特别是受到激素变化或产后抑郁等潜在挑战的影响时？',
          scaleLabels: {
            minEn: 'Not at all – I don\'t pay attention to this',
            minZh: '完全不关注 – 不曾留意',
            maxEn: 'Very much – I actively offer support',
            maxZh: '非常关注 – 会主动提供支持'
          },
          tags: ['社交情商']
        },
        {
          id: 36,
          type: 'scale-question',
          textEn: 'How equipped do you feel to recognize when a mother colleague might be experiencing emotional difficulties due to life transitions (e.g., childbirth, parenting stress)?',
          textZh: '您认为自己在识别职场母亲因生活转变（如生育、育儿压力）而产生情绪困难方面的能力如何？',
          scaleLabels: {
            minEn: 'Not equipped at all – I never consider this',
            minZh: '完全没有能力 – 从未考虑',
            maxEn: 'Very equipped – I can identify and address it appropriately',
            maxZh: '非常有能力 – 能妥善应对'
          },
          tags: ['情绪调节']
        },
        {
          id: 37,
          type: 'scale-question',
          textEn: 'How much do you feel that your mother\'s role influenced your early understanding of leadership or responsibility?',
          textZh: '您认为您的母亲在多大程度上影响了童年时期您对领导力、责任感、同理心的认知？',
          scaleLabels: {
            minEn: 'Not at all',
            minZh: '没有影响',
            maxEn: 'Very strongly',
            maxZh: '非常深远'
          },
          tags: ['自我意识']
        }
      ],
      privacyStatement: {
        titleEn: 'Privacy Statement',
        titleZh: '隐私声明',
        contentEn: 'Your information will only be used for verification purposes and to formulate your CHON personality test. It will not be shared, disclosed, or used for any other purpose. We are committed to protecting your privacy and ensuring the security of your data.',
        contentZh: '您的信息将仅用于验证目的和制定您的 CHON 性格测试。您的信息不会被共享、披露或用于任何其他目的。我们重视您的隐私，并承诺保护您的数据安全。'
      }
    }
  };

  // Helper to get current questionnaire
  const getCurrentQuestionnaire = (): QuestionnaireContext | null => {
    if (selectedIdentities.has('both')) {
      if (showingPrimaryQuestionnaire) {
        return activeQuestionnaire ? questionnaires[activeQuestionnaire] : null;
      } else {
        return secondaryQuestionnaire ? questionnaires[secondaryQuestionnaire] : null;
      }
    }
    return activeQuestionnaire ? questionnaires[activeQuestionnaire] : null;
  };

  // Helper to get current questions
  const getCurrentQuestions = (): Question[] => {
    return getCurrentQuestionnaire()?.questions || [];
  };
  
  // Helper to get total questions count
  const getTotalQuestions = (): number => {
    return getCurrentQuestionnaire()?.totalQuestions || 0;
  };
  
  // 从本地存储加载答案数据
  useEffect(() => {
    const savedAnswers = localStorage.getItem('chon_personality_answers');
    const savedStep = localStorage.getItem('chon_personality_step');
    const savedIdentities = localStorage.getItem('chon_personality_identities');
    const savedUserChoice = localStorage.getItem('chon_personality_user_choice');
    const savedShowFirstPage = localStorage.getItem('chon_personality_show_first_page');
    const savedShowSecondPage = localStorage.getItem('chon_personality_show_second_page');
    const savedShowThirdPage = localStorage.getItem('chon_personality_show_third_page');
    const savedShowFourthPage = localStorage.getItem('chon_personality_show_fourth_page');
    const savedShowFifthPage = localStorage.getItem('chon_personality_show_fifth_page');
    
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    
    if (savedStep && isValidStep(savedStep)) {
      setStep(savedStep as TestStep);
    }
    
    if (savedIdentities) {
      setSelectedIdentities(new Set(JSON.parse(savedIdentities)));
    }
    
    if (savedUserChoice) {
      setUserChoice(savedUserChoice);
    }
    
    if (savedShowFirstPage) {
      setShowFirstPage(savedShowFirstPage === 'true');
    }
    
    if (savedShowSecondPage) {
      setShowSecondPage(savedShowSecondPage === 'true');
    }
    
    if (savedShowThirdPage) {
      setShowThirdPage(savedShowThirdPage === 'true');
    }
    
    if (savedShowFourthPage) {
      setShowFourthPage(savedShowFourthPage === 'true');
    }
    
    if (savedShowFifthPage) {
      setShowFifthPage(savedShowFifthPage === 'true');
    }
  }, []);
  
  // 验证步骤值是否有效
  const isValidStep = (step: string): boolean => {
    return ['intro', 'identity', 'privacy', 'questionnaire'].includes(step);
  };
  
  // 保存答案到本地存储
  useEffect(() => {
    localStorage.setItem('chon_personality_answers', JSON.stringify(answers));
    if (Object.keys(answers).length > 0) {
      setShowSaveIndicator(true);
      const timer = setTimeout(() => {
        setShowSaveIndicator(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [answers]);
  
  // 保存当前步骤到本地存储
  useEffect(() => {
    localStorage.setItem('chon_personality_step', step);
  }, [step]);
  
  // 保存身份选择到本地存储
  useEffect(() => {
    localStorage.setItem('chon_personality_identities', JSON.stringify(Array.from(selectedIdentities)));
  }, [selectedIdentities]);
  
  // 保存用户选择到本地存储
  useEffect(() => {
    if (userChoice) {
      localStorage.setItem('chon_personality_user_choice', userChoice);
    }
  }, [userChoice]);
  
  // 保存问题索引和页面状态到本地存储
  useEffect(() => {
    localStorage.setItem('chon_personality_show_first_page', showFirstPage.toString());
    localStorage.setItem('chon_personality_show_second_page', showSecondPage.toString());
    localStorage.setItem('chon_personality_show_third_page', showThirdPage.toString());
    localStorage.setItem('chon_personality_show_fourth_page', showFourthPage.toString());
    localStorage.setItem('chon_personality_show_fifth_page', showFifthPage.toString());
  }, [showFirstPage, showSecondPage, showThirdPage, showFourthPage, showFifthPage]);

  // Update white theme state when step changes
  useEffect(() => {
    if (onWhiteThemeChange) {
      const isWhiteTheme = step === 'privacy' || step === 'questionnaire';
      onWhiteThemeChange(isWhiteTheme);
      
      // Remove hormone-related style customization since those pages no longer exist
        const existingStyle = document.getElementById('hormone-style');
        if (existingStyle) {
          existingStyle.remove();
      }
    }
    
    // 根据步骤决定是否隐藏UI元素
    if (onHideUIChange) {
      const shouldHideUI = step === 'privacy' || step === 'questionnaire';
      onHideUIChange(shouldHideUI);
    }
  }, [step, onWhiteThemeChange, onHideUIChange]);

  // 模拟获取同意/不同意的比例数据
  useEffect(() => {
    // 这里可以替换为实际的API调用，获取真实数据
    // 目前暂时使用硬编码的数值
    setAgreePercentage(65);
  }, []);

  // Reset userChoice when returning to intro step
  useEffect(() => {
    if (step === 'intro') {
      setUserChoice(null);
    }
  }, [step]);
  
  const handleOptionClick = (choice: string) => {
    setUserChoice(choice);
  };
  
  const handleBeginTest = () => {
    setStep('identity');
  };

  const handleIdentitySelect = (identity: IdentityType) => {
    const newSelection = new Set(selectedIdentities);
    
    if (identity === 'other') {
      // If 'other' is selected, clear all other selections
      if (newSelection.has('other')) {
        newSelection.delete('other');
      } else {
        newSelection.clear();
        newSelection.add('other');
      }
    } else {
      // Handle mother/corporate selection
      if (newSelection.has(identity)) {
        newSelection.delete(identity);
      } else {
        newSelection.delete('other'); // Remove 'other' if it was selected
        newSelection.add(identity);
      }
    }
    
    setSelectedIdentities(newSelection);
  };

  const handleContinue = () => {
    if (selectedIdentities.size > 0) {
      // Set the active questionnaire type based on selection
      if (selectedIdentities.has('both')) {
        // For "both" option, set mother as primary and corporate as secondary
        setActiveQuestionnaire('mother');
        setSecondaryQuestionnaire('corporate');
        // Initialize separate answer sets
        setPrimaryAnswers({});
        setSecondaryAnswers({});
      } else if (selectedIdentities.has('mother')) {
        setActiveQuestionnaire('mother');
      } else if (selectedIdentities.has('corporate')) {
        setActiveQuestionnaire('corporate');
      } else if (selectedIdentities.has('other')) {
        setActiveQuestionnaire('other');
      }
      
      setStep('privacy');
    }
  };

  const handlePrivacyContinue = () => {
    // 确保所有页面状态初始化
    setShowFirstPage(true);
    setShowSecondPage(false);
    setShowThirdPage(false);
    setShowFourthPage(false);
    setShowFifthPage(false);
    
    // 设置为问卷步骤
    setStep('questionnaire');
  };

  const isIdentitySelected = (identity: IdentityType): boolean => {
    return selectedIdentities.has(identity);
  };

  // Handle answer selection for multiple choice questions
  const handleMultipleChoiceAnswer = (questionId: number, optionId: string) => {
    const currentAnswers = getCurrentAnswers();
    setCurrentAnswers({
      ...currentAnswers,
      [questionId]: optionId
    });
    
    // 更新标签得分
    updateTagScores(questionId, optionId);
  };

  // Handle text input for free text questions
  const handleTextAnswer = (questionId: number, text: string) => {
    const currentAnswers = getCurrentAnswers();
    // Only update answer when there's text content
    if (text.trim()) {
      setCurrentAnswers({
        ...currentAnswers,
        [questionId]: text
      });
    } else {
      // Remove the answer if text is empty to accurately track progress
      const newAnswers = {...currentAnswers};
        delete newAnswers[questionId];
      setCurrentAnswers(newAnswers);
    }
  };

  // Handle scale question answer
  const handleScaleAnswer = (questionId: number, value: string) => {
    const currentAnswers = getCurrentAnswers();
    setCurrentAnswers({
      ...currentAnswers,
      [questionId]: value
    });
    
    // 更新标签得分
    updateTagScores(questionId, value);
  };

  // Helper to get current answers based on which questionnaire is active
  const getCurrentAnswers = (): Record<number, string> => {
    if (selectedIdentities.has('both')) {
      return showingPrimaryQuestionnaire ? primaryAnswers : secondaryAnswers;
    }
    return answers;
  };

  // Helper to set current answers based on which questionnaire is active
  const setCurrentAnswers = (newAnswers: Record<number, string>) => {
    if (selectedIdentities.has('both')) {
      if (showingPrimaryQuestionnaire) {
        setPrimaryAnswers(newAnswers);
      } else {
        setSecondaryAnswers(newAnswers);
      }
    } else {
      setAnswers(newAnswers);
    }
  };

  // Add a method to switch between questionnaires for "both" type
  const switchQuestionnaire = () => {
    if (selectedIdentities.has('both') && secondaryQuestionnaire) {
      setShowingPrimaryQuestionnaire(!showingPrimaryQuestionnaire);
      // Reset question index when switching
      setShowFirstPage(true);
      setShowSecondPage(false);
      setShowThirdPage(false);
      // Reset all page visibility states
      setShowFourthPage(false);
      setShowFifthPage(false);
    }
  };

  const renderQuestionnaireContent = () => {
    // Get current questionnaire and questions
    const currentQuestionnaire = getCurrentQuestionnaire();
    const currentQuestions = getCurrentQuestions();
    
    if (!currentQuestionnaire) {
      return <div>No questionnaire selected</div>;
    }
    
    // Calculate progress based on completed questions for active questionnaire
    const answeredQuestionsCount = Object.keys(getCurrentAnswers()).length;
    const questionProgress = (answeredQuestionsCount / getTotalQuestions()) * 100;

    // 分别渲染不同类型的问卷
    if (currentQuestionnaire.type === 'mother') {
      return renderMotherQuestionnaire(currentQuestions);
    } else if (currentQuestionnaire.type === 'corporate') {
      return renderCorporateQuestionnaire(currentQuestions);
    } else if (currentQuestionnaire.type === 'other') {
      return renderOtherQuestionnaire(currentQuestions);
    }

    // 默认返回空内容
    return <div>Unknown questionnaire type</div>;
  };

  // 渲染母亲问卷的函数
  const renderMotherQuestionnaire = (questions: Question[]) => {
    return (
      <div className="questionnaire-content mother-questionnaire" lang={language}>
        {/* Progress bar */}
        <div className="question-progress-container">
          <div className="question-progress-bar">
            <div 
              className="question-progress-fill" 
              style={{ width: `${calculatedQuestionnaireProgress()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Show switcher for "both" option */}
        {selectedIdentities.has('both') && (
          <div className="questionnaire-switcher">
            <button 
              className={`switcher-button ${showingPrimaryQuestionnaire ? 'active' : ''}`}
              onClick={() => {
                if (!showingPrimaryQuestionnaire) switchQuestionnaire();
              }}
            >
              {language === 'en' ? 'Mother Questionnaire' : '母亲问卷'}
            </button>
              <button 
              className={`switcher-button ${!showingPrimaryQuestionnaire ? 'active' : ''}`}
                onClick={() => {
                if (showingPrimaryQuestionnaire) switchQuestionnaire();
                }}
              >
              {language === 'en' ? 'Corporate Questionnaire' : '企业问卷'}
              </button>
            </div>
        )}
        
        {/* 母亲问卷分页内容 */}
        {
          showFirstPage ? (
            // 第1页: ID 1-8，无标题，只有问题
            <div className="first-page-questions first-page-true">
              {questions.slice(0, 8).map((question) => (
              <div key={question.id} className="question-container">
                {renderQuestionText(question)}
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                        onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                      >
                        <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'text-input' && (
                  <div className="text-input-container">
                    <input
                      type="text"
                      className="text-answer-input"
                      value={getCurrentAnswers()[question.id] || ''}
                      onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                      placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                    />
                  </div>
                )}
                
                {question.type === 'scale-question' && (
                  <div className="scale-question-container">
                    <div className="scale-labels-wrapper">
                      <div className="scale-extreme-labels">
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                      </div>
                      <div className="scale-options">
                        {['1', '2', '3', '4', '5'].map((value) => (
                          <div 
                            key={value}
                            className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                            onClick={() => handleScaleAnswer(question.id, value)}
                          >
                            <div className="scale-circle"></div>
                            <span className="scale-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="question-navigation">
              <button 
                className="nav-button next-button"
                onClick={() => {
                    setShowFirstPage(false);
                    setShowThirdPage(true);
                }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 1 && parseInt(id) <= 8).length < 8}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
          ) : showThirdPage ? (
            // 第2页: ID 9-21，标题"I. About Work-Life Balance / 关于工作与生活的平衡"
          <div className="first-page-questions">
              <h1 className="section-title">
                          {language === 'en' 
                  ? 'I. About Work-Life Balance' 
                  : 'I. 关于工作与生活的平衡'}
              </h1>
              
              {questions.slice(8, 21).map((question) => (
              <div key={question.id} className="question-container">
                {renderQuestionText(question)}
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                        onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                      >
                        <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                      </div>
                    ))}
                  </div>
                )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                  </div>
                )}
                
                {question.type === 'scale-question' && (
                  <div className="scale-question-container">
                    <div className="scale-labels-wrapper">
                      <div className="scale-extreme-labels">
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                      </div>
                      <div className="scale-options">
                        {['1', '2', '3', '4', '5'].map((value) => (
                          <div 
                            key={value}
                            className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                            onClick={() => handleScaleAnswer(question.id, value)}
                          >
                            <div className="scale-circle"></div>
                            <span className="scale-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="question-navigation">
              <button 
                className="nav-button prev-button"
                onClick={() => {
                    setShowThirdPage(false);
                    setShowFirstPage(true);
                }}
              >
                {language === 'en' ? 'Back' : '返回'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                    setShowThirdPage(false);
                    setShowFourthPage(true);
                }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 9 && parseInt(id) <= 21).length < 13}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
          ) : showFourthPage ? (
            // 第3页: ID 22-35，标题"II. About Us, CHON / 关于我们"
          <div className="first-page-questions">
            <h1 className="section-title">
              {language === 'en' 
                ? 'II. About Us, CHON' 
                : 'II. 关于我们'}
            </h1>
            
              {questions.slice(21, 35).map((question) => (
              <div key={question.id} className="question-container">
                {renderQuestionText(question)}
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                        onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                      >
                        <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'text-input' && (
                  <div className="text-input-container">
                    <input
                      type="text"
                      className="text-answer-input"
                      value={getCurrentAnswers()[question.id] || ''}
                      onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                      placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                    />
                  </div>
                )}
                
                {question.type === 'scale-question' && (
                  <div className="scale-question-container">
                    <div className="scale-labels-wrapper">
                      <div className="scale-extreme-labels">
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                      </div>
                      <div className="scale-options">
                        {['1', '2', '3', '4', '5'].map((value) => (
                          <div 
                            key={value}
                            className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                            onClick={() => handleScaleAnswer(question.id, value)}
                          >
                            <div className="scale-circle"></div>
                            <span className="scale-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="question-navigation">
              <button 
                className="nav-button prev-button"
                onClick={() => {
                    setShowFourthPage(false);
                    setShowThirdPage(true);
                }}
              >
                {language === 'en' ? 'Back' : '返回'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                    setShowFourthPage(false);
                    setShowFifthPage(true);
                }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 22 && parseInt(id) <= 35).length < 14}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
          ) : showFifthPage ? (
            // 第4页: ID 36-48，标题"III. About Motherhood"
          <div className="first-page-questions">
              <h1 className="section-title">
                {language === 'en' 
                  ? 'III. About Motherhood' 
                  : 'III. 关于母亲'}
              </h1>
            
              {questions.slice(35, 48).map((question) => (
              <div key={question.id} className="question-container">
                {renderQuestionText(question)}
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                        onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                      >
                        <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                  </div>
                )}
                
                {question.type === 'scale-question' && (
                  <div className="scale-question-container">
                    <div className="scale-labels-wrapper">
                      <div className="scale-extreme-labels">
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                        <span className="scale-extreme-label">
                          {language === 'en' 
                            ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                            : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                        </span>
                      </div>
                      <div className="scale-options">
                        {['1', '2', '3', '4', '5'].map((value) => (
                          <div 
                            key={value}
                            className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                            onClick={() => handleScaleAnswer(question.id, value)}
                          >
                            <div className="scale-circle"></div>
                            <span className="scale-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="question-navigation">
              <button 
                className="nav-button prev-button"
                onClick={() => {
                    setShowFifthPage(false);
                    setShowFourthPage(true);
                }}
              >
                {language === 'en' ? 'Back' : '返回'}
              </button>
              
              <button 
                className="nav-button finish-button"
                onClick={() => {
                    // 计算结果并跳转到结果页面
                    finishQuestionnaire();
                }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 36 && parseInt(id) <= 48).length < 13}
              >
                {language === 'en' ? 'Finish' : '完成'}
              </button>
            </div>
          </div>
          ) : null
        }
      </div>
    );
  };

  const renderPrivacyStatement = () => {
    const currentQuestionnaire = getCurrentQuestionnaire();
    
    if (!currentQuestionnaire) {
      return null;
    }
    
    // 根据问卷类型添加相应的CSS类
    const privacyClass = currentQuestionnaire.type === 'other' ? 'other-privacy' : 'mother-privacy';
    
    return (
      <div className={`privacy-statement ${privacyClass}`} lang={language}>
        <p className="privacy-text" lang={language}>
          {language === 'en' 
            ? currentQuestionnaire.privacyStatement?.contentEn || "Your information will only be used for verification purposes and to formulate your CHON personality test. It will not be shared, disclosed, or used for any other purpose. We value your honesty and are committed to protecting your privacy and ensuring the security of your data."
            : currentQuestionnaire.privacyStatement?.contentZh || "您的信息将仅用于验证目的和制定您的 CHON 性格测试。您的信息不会被共享、披露或用于任何其他目的。我们重视您的诚实，并承诺保护您的隐私，确保您的数据安全。"
          }
        </p>
        <button 
          className="privacy-continue"
          onClick={handlePrivacyContinue}
          lang={language}
        >
          <span>{language === 'en' ? 'CONTINUE' : '继续'}</span>
          <span className="continue-arrow">→</span>
        </button>
      </div>
    );
  };

  // Render content based on step
  const renderContent = () => {
    switch (step) {
      case 'intro':
        return renderIntroContent();
      case 'identity':
        return renderIdentitySelection();
      case 'privacy':
        return renderPrivacyStatement();
      case 'questionnaire':
        return renderQuestionnaireContent();
      default:
        return null;
    }
  };

  // Exit button that appears only on questionnaire and privacy screens
  const handleExit = (e: React.MouseEvent) => {
    // 添加确认对话框
    const confirmExit = window.confirm(
      language === 'en' 
        ? 'Are you sure you want to exit? All progress will be lost.'
        : '确定要退出吗？所有进度将会丢失。'
    );
    
    if (!confirmExit) {
      e.preventDefault(); // 阻止导航
      return;
    }
    
    // 清空所有localStorage数据
    localStorage.clear();
    
    console.log('已清空所有测试数据');
  };

  const exitButton = (
    <div className="exit-actions">
      <Link to="/" className="exit-button" lang={language} onClick={handleExit}>
        {language === 'en' ? '← Exit' : '← 退出'}
      </Link>
    </div>
  );

  // Only white theme steps should have no-header class
  const containerClass = step === 'privacy' || step === 'questionnaire' 
    ? 'personality-test-container no-header' 
    : 'personality-test-container';

  // 计算问卷进度
  const calculatedQuestionnaireProgress = () => {
    // For "both" option, calculate progress based on active questionnaire
    const answeredCount = Object.keys(getCurrentAnswers()).length;
    const total = getTotalQuestions();
    return total > 0 ? (answeredCount / total) * 100 : 0;
  };

  // 在intro页面确保显示问题和选项
  const renderIntroContent = () => {
    const wrappedQuestion = `<span lang="${language}">${language === 'en' ? t.intro.question : '母亲是天生的领导者。'}</span>`;
    
  return (
        <div className="intro-content" lang={language}>
          <h1 className="intro-question" 
              dangerouslySetInnerHTML={{ __html: wrappedQuestion }}
              lang={language}>
          </h1>
          
          {!userChoice ? (
            <div className="test-options" lang={language}>
              <button 
                className="test-option-button"
                onClick={() => handleOptionClick('yes')}
                lang={language}
              >
                {t.intro.yes}
              </button>
              <button 
                className="test-option-button"
                onClick={() => handleOptionClick('no')}
                lang={language}
              >
                {t.intro.no}
              </button>
            </div>
          ) : (
            <>
              <div className="progress-container" lang={language}>
                <div className="percentage-labels" lang={language}>
                <span className="agree-label" lang={language}>{t.intro.agree} ({agreePercentage}%)</span>
                <span className="disagree-label" lang={language}>{t.intro.disagree} ({100 - agreePercentage}%)</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                  style={{ width: `${agreePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <button 
                className="begin-test-button" 
                onClick={handleBeginTest}
                lang={language}
              >
                {t.intro.beginTest}
              </button>
            </>
          )}
        </div>
    );
  };

  // Render the identity selection UI
  const renderIdentitySelection = () => {
    return (
      <div className="identity-selection" lang={language}>
        <h2 className="identity-heading">
          {language === 'en' ? 'Select your identity:' : '选择您的身份:'}
        </h2>
        <div className="identity-options">
          <div 
            className={`identity-option ${isIdentitySelected('mother') ? 'selected' : ''}`}
            onClick={() => handleIdentitySelect('mother')}
          >
            <span>{language === 'en' ? 'Mother' : '母亲'}</span>
          </div>
          <div 
            className={`identity-option corporate ${isIdentitySelected('corporate') ? 'selected' : ''}`}
            onClick={() => handleIdentitySelect('corporate')}
          >
            <span>{language === 'en' ? 'Corporate Manager' : '企业管理者'}</span>
          </div>
          <div 
            className={`identity-option both ${isIdentitySelected('both') ? 'selected' : ''}`}
            onClick={() => handleIdentitySelect('both')}
          >
            <span>{language === 'en' ? 'Both' : '两者都是'}</span>
          </div>
          <div 
            className={`identity-option other ${isIdentitySelected('other') ? 'selected' : ''}`}
            onClick={() => handleIdentitySelect('other')}
          >
            <span>{language === 'en' ? 'Other' : '其他'}</span>
          </div>
        </div>
        <button 
          className="continue-button"
          onClick={handleContinue}
          disabled={selectedIdentities.size === 0}
          lang={language}
        >
          {language === 'en' ? 'CONTINUE →' : '继续 →'}
        </button>
        </div>
    );
  };

  // 在多个地方复用的问题文本渲染函数
  const renderQuestionText = (question: Question) => {
    return (
      <h2 className="question-text">
        {language === 'en' ? question.textEn : question.textZh}
        {/* 标签不再前端显示，但数据仍保留在question对象中用于后续分析 */}
      </h2>
    );
  };

  // 当用户回答问题时，更新相应标签的得分
  const updateTagScores = (questionId: number, value: string) => {
    const question = getCurrentQuestions().find(q => q.id === questionId);
    if (!question || !question.tags || question.tags.length === 0) return;
    
    console.log(`处理问题 ${questionId} 的回答，值: ${value}, 类型: ${question.type}`);
    
    // 对于量表问题，处理分数转换
    let score: number;
    if (question.type === 'scale-question') {
      if (['A', 'B', 'C', 'D', 'E'].includes(value)) {
        // 从"A"到"E"映射为1到5的分数
        const scoreMap: Record<string, number> = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5};
        score = scoreMap[value] || 0;
      } else {
        // 直接将数字字符串转换为数字
        score = parseInt(value, 10) || 0;
      }
      
      console.log(`问题 ${questionId} 的分数已转换: ${value} -> ${score}`);
    } else {
      // 对于多选题，暂时只记录选择了哪个选项，不计算分数
      score = 0;
    }
    
    // 为每个标签更新分数
    const newTagScores = {...tagScores};
    
    // 创建问题ID到分数的映射
    const questionScoreMap: Record<string, Record<number, number>> = {};
    
    // 从localStorage加载现有的问题ID-分数映射
    question.tags.forEach(tag => {
      const savedMap = localStorage.getItem(`questionScores_${tag}`);
      if (savedMap) {
        try {
          questionScoreMap[tag] = JSON.parse(savedMap);
        } catch (e) {
          console.error(`解析标签 ${tag} 的问题分数映射出错:`, e);
          questionScoreMap[tag] = {};
        }
      } else {
        questionScoreMap[tag] = {};
      }
      
      // 更新当前问题的分数
      questionScoreMap[tag][questionId] = score;
      
      // 保存更新后的映射
      localStorage.setItem(`questionScores_${tag}`, JSON.stringify(questionScoreMap[tag]));
      
      // 将所有问题的分数转换为数组
      if (!newTagScores[tag]) {
        newTagScores[tag] = [];
      }
      
      // 将问题分数映射的值填入数组
      const scoreArray = Object.values(questionScoreMap[tag]);
      newTagScores[tag] = scoreArray;
      
      console.log(`更新标签 ${tag} 的分数，问题 ${questionId}: ${score}`);
      console.log(`标签 ${tag} 的问题-分数映射:`, questionScoreMap[tag]);
    });
    
    setTagScores(newTagScores);
    
    // 保存标签分数到本地存储
    localStorage.setItem('tagScores', JSON.stringify(newTagScores));
    
    // 计算并保存标签总分和比例
    calculateAndSaveTagStats(newTagScores);
    
    console.log(`标签分数已更新并保存:`, newTagScores);
  };

  // 计算并保存每个标签的统计数据（总分、平均分、比例等）
  const calculateAndSaveTagStats = (currentTagScores: Record<string, number[]>) => {
    // 定义标签统计数据结构
    interface TagStats {
      userScore: number;      // 用户实际得分
      totalPossibleScore: number; // 标签总满分
      scorePercentage: number;   // 得分比例
      averageScore: number;    // 平均分
      answeredQuestions: number; // 已回答问题数
    }
    
    const tagStats: Record<string, TagStats> = {};
    const allTags = ['自我意识', '奉献精神', '社交情商', '情绪调节', '客观能力', '核心耐力'];
    
    // 计算每个标签下有多少量表问题
    const tagQuestionCounts: Record<string, number> = {};
    const questions = getCurrentQuestions();
    
    questions.forEach(question => {
      if (question.type === 'scale-question' && question.tags) {
        question.tags.forEach(tag => {
          if (!tagQuestionCounts[tag]) {
            tagQuestionCounts[tag] = 0;
          }
          tagQuestionCounts[tag] += 1;
        });
      }
    });
    
    // 计算每个标签的统计数据
    allTags.forEach(tag => {
      const scores = currentTagScores[tag] || [];
      // 只计算有效分数（大于0的分数）
      const validScores = scores.filter(score => score > 0);
      const userScore = validScores.reduce((sum, score) => sum + score, 0);
      const answeredQuestions = validScores.length;
      const totalPossibleQuestions = tagQuestionCounts[tag] || 0;
      const totalPossibleScore = totalPossibleQuestions * 5; // 每个问题最高5分
      const scorePercentage = totalPossibleScore > 0 ? (userScore / totalPossibleScore) * 100 : 0;
      const averageScore = answeredQuestions > 0 ? userScore / answeredQuestions : 0;
      
      tagStats[tag] = {
        userScore,
        totalPossibleScore,
        scorePercentage,
        averageScore,
        answeredQuestions
      };
    });
    
    // 保存标签统计数据到本地存储
    localStorage.setItem('tagStats', JSON.stringify(tagStats));
    
    // 打印统计信息的表格
    console.log('==== 标签得分统计 ====');
    console.table(tagStats);
    
    return tagStats;
  };

  // 获取标签统计数据
  const getTagStats = (): Record<string, any> => {
    const savedStats = localStorage.getItem('tagStats');
    if (savedStats) {
      try {
        return JSON.parse(savedStats);
      } catch (e) {
        console.error('Error parsing saved tag statistics:', e);
        return {};
      }
    }
    return {};
  };

  // 在useEffect中添加从localStorage读取标签得分和统计数据的代码
  useEffect(() => {
    // 定义所有标签
    const allTags = ['自我意识', '奉献精神', '社交情商', '情绪调节', '客观能力', '核心耐力'];
    const loadedTagScores: Record<string, number[]> = {};
    
    // 从问题分数映射中加载标签分数
    allTags.forEach(tag => {
      const savedMap = localStorage.getItem(`questionScores_${tag}`);
      if (savedMap) {
        try {
          const questionScoreMap = JSON.parse(savedMap);
          // 将问题分数映射的值填入数组
          loadedTagScores[tag] = Object.values(questionScoreMap);
          console.log(`成功加载标签 ${tag} 的问题分数映射:`, questionScoreMap);
        } catch (e) {
          console.error(`解析标签 ${tag} 的问题分数映射出错:`, e);
          loadedTagScores[tag] = [];
        }
      } else {
        // 尝试从旧格式加载
        const savedTagScores = localStorage.getItem('tagScores');
        if (savedTagScores) {
          try {
            const parsedScores = JSON.parse(savedTagScores);
            if (parsedScores[tag]) {
              loadedTagScores[tag] = parsedScores[tag];
            } else {
              loadedTagScores[tag] = [];
            }
          } catch (e) {
            console.error('解析旧格式标签分数出错:', e);
            loadedTagScores[tag] = [];
          }
        }
      }
    });
    
    // 设置加载的标签分数
    if (Object.keys(loadedTagScores).length > 0) {
      setTagScores(loadedTagScores);
      console.log('成功加载所有标签分数:', loadedTagScores);
      
      // 如果有标签分数但没有统计数据，重新计算一次
      if (!localStorage.getItem('tagStats')) {
        calculateAndSaveTagStats(loadedTagScores);
      }
    }
  }, []);

  // 计算每个标签的总分和平均分
  const calculateTagResults = () => {
    const results: Record<string, {total: number, average: number, count: number}> = {};
    
    Object.entries(tagScores).forEach(([tag, scores]) => {
      // 过滤掉0分(未计分的多选题)
      const validScores = scores.filter(score => score > 0);
      const total = validScores.reduce((sum, score) => sum + score, 0);
      const count = validScores.length;
      const average = count > 0 ? total / count : 0;
      
      results[tag] = {
        total,
        average,
        count
      };
    });
    
    return results;
  };

  // 导出结果的函数，可以在需要导出用户结果时调用
  const exportResults = () => {
    const tagResults = calculateTagResults();
    const allAnswers = {
      primary: primaryAnswers,
      secondary: secondaryAnswers
    };
    
    // 在这里你可以加入导出逻辑，例如发送到服务器或下载为文件
    console.log('Tag Results:', tagResults);
    console.log('All Answers:', allAnswers);
    
    // 示例：将结果转换为JSON并下载
    const resultsBlob = new Blob(
      [JSON.stringify({ tagResults, allAnswers }, null, 2)], 
      { type: 'application/json' }
    );
    
    const url = URL.createObjectURL(resultsBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personality_test_results_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 渲染企业问卷的函数
  const renderCorporateQuestionnaire = (questions: Question[]) => {
    return (
      <div className="questionnaire-content corporate-questionnaire" lang={language}>
        {/* Progress bar */}
        <div className="question-progress-container">
          <div className="question-progress-bar">
            <div 
              className="question-progress-fill" 
              style={{ width: `${calculatedQuestionnaireProgress()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Show switcher for "both" option */}
        {selectedIdentities.has('both') && (
          <div className="questionnaire-switcher">
            <button 
              className={`switcher-button ${showingPrimaryQuestionnaire ? 'active' : ''}`}
              onClick={() => {
                if (!showingPrimaryQuestionnaire) switchQuestionnaire();
              }}
            >
              {language === 'en' ? 'Mother Questionnaire' : '母亲问卷'}
            </button>
            <button 
              className={`switcher-button ${!showingPrimaryQuestionnaire ? 'active' : ''}`}
              onClick={() => {
                if (showingPrimaryQuestionnaire) switchQuestionnaire();
              }}
            >
              {language === 'en' ? 'Corporate Questionnaire' : '企业问卷'}
            </button>
          </div>
        )}
        
        {/* 企业问卷分页内容 */}
        {
          showFirstPage ? (
            // 第1页: ID 1-7，无标题
            <div className="first-page-questions first-page-true">
              {questions.slice(0, 7).map((question) => (
                <div key={question.id} className="question-container">
                  {renderQuestionText(question)}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="answer-options">
                      {question.options?.map(option => (
                        <div 
                          key={option.id}
                          className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                        >
                          <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                    </div>
                  )}
                  
                  {question.type === 'scale-question' && (
                    <div className="scale-question-container">
                      <div className="scale-labels-wrapper">
                        <div className="scale-extreme-labels">
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                        </div>
                        <div className="scale-options">
                          {['1', '2', '3', '4', '5'].map((value) => (
                            <div 
                              key={value}
                              className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                              onClick={() => handleScaleAnswer(question.id, value)}
                            >
                              <div className="scale-circle"></div>
                              <span className="scale-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="question-navigation">
                <button 
                  className="nav-button next-button"
                  onClick={() => {
                    setShowFirstPage(false);
                    setShowSecondPage(true);
                  }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 1 && parseInt(id) <= 7).length < 7}
                >
                  {language === 'en' ? 'Continue' : '继续'}
                </button>
              </div>
            </div>
          ) : showSecondPage ? (
            // 第2页: ID 8-21，标题"I. 关于您的领导力 / About Your Leadership"
            <div className="first-page-questions">
              <h1 className="section-title">
                {language === 'en' 
                  ? 'I. About Your Leadership' 
                  : 'I. 关于您的领导力'}
              </h1>
              
              {questions.slice(7, 21).map((question) => (
                <div key={question.id} className="question-container">
                  {renderQuestionText(question)}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="answer-options">
                      {question.options?.map(option => (
                        <div 
                          key={option.id}
                          className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                        >
                          <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                    </div>
                  )}
                  
                  {question.type === 'scale-question' && (
                    <div className="scale-question-container">
                      <div className="scale-labels-wrapper">
                        <div className="scale-extreme-labels">
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                        </div>
                        <div className="scale-options">
                          {['1', '2', '3', '4', '5'].map((value) => (
                            <div 
                              key={value}
                              className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                              onClick={() => handleScaleAnswer(question.id, value)}
                            >
                              <div className="scale-circle"></div>
                              <span className="scale-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="question-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={() => {
                    setShowSecondPage(false);
                    setShowFirstPage(true);
                  }}
                >
                  {language === 'en' ? 'Back' : '返回'}
                </button>
                
                <button 
                  className="nav-button next-button"
                  onClick={() => {
                    setShowSecondPage(false);
                    setShowThirdPage(true);
                  }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 8 && parseInt(id) <= 21).length < 14}
                >
                  {language === 'en' ? 'Continue' : '继续'}
                </button>
              </div>
            </div>
          ) : showThirdPage ? (
            // 第3页: ID 22-36，标题"II. About Us, CHON / 关于我们"
            <div className="first-page-questions">
              <h1 className="section-title">
                {language === 'en' 
                  ? 'II. About Us, CHON' 
                  : 'II. 关于我们'}
              </h1>
              
              {questions.slice(21, 36).map((question) => (
                <div key={question.id} className="question-container">
                  {renderQuestionText(question)}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="answer-options">
                      {question.options?.map(option => (
                        <div 
                          key={option.id}
                          className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                        >
                          <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                    </div>
                  )}
                  
                  {question.type === 'scale-question' && (
                    <div className="scale-question-container">
                      <div className="scale-labels-wrapper">
                        <div className="scale-extreme-labels">
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                        </div>
                        <div className="scale-options">
                          {['1', '2', '3', '4', '5'].map((value) => (
                            <div 
                              key={value}
                              className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                              onClick={() => handleScaleAnswer(question.id, value)}
                            >
                              <div className="scale-circle"></div>
                              <span className="scale-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="question-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={() => {
                    setShowThirdPage(false);
                    setShowSecondPage(true);
                  }}
                >
                  {language === 'en' ? 'Back' : '返回'}
                </button>
                
                <button 
                  className="nav-button next-button"
                  onClick={() => {
                    setShowThirdPage(false);
                    setShowFourthPage(true);
                  }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 22 && parseInt(id) <= 36).length < 15}
                >
                  {language === 'en' ? 'Continue' : '继续'}
                </button>
              </div>
            </div>
          ) : showFourthPage ? (
            // 第4页: ID 37-47，标题"III. About Motherhood 关于母亲"
            <div className="first-page-questions">
              <h1 className="section-title">
                {language === 'en' 
                  ? 'III. About Motherhood' 
                  : 'III. 关于母亲'}
              </h1>
              
              {questions.slice(36, 47).map((question) => (
                <div key={question.id} className="question-container">
                  {renderQuestionText(question)}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="answer-options">
                      {question.options?.map(option => (
                        <div 
                          key={option.id}
                          className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                        >
                          <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                    </div>
                  )}
                  
                  {question.type === 'scale-question' && (
                    <div className="scale-question-container">
                      <div className="scale-labels-wrapper">
                        <div className="scale-extreme-labels">
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                        </div>
                        <div className="scale-options">
                          {['1', '2', '3', '4', '5'].map((value) => (
                            <div 
                              key={value}
                              className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                              onClick={() => handleScaleAnswer(question.id, value)}
                            >
                              <div className="scale-circle"></div>
                              <span className="scale-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="question-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={() => {
                    setShowFourthPage(false);
                    setShowThirdPage(true);
                  }}
                >
                  {language === 'en' ? 'Back' : '返回'}
                </button>
                
                <button 
                  className="nav-button finish-button"
                  onClick={() => {
                    // 计算结果并跳转到结果页面
                    finishQuestionnaire();
                  }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 32 && parseInt(id) <= 42).length < 11}
                >
                  {language === 'en' ? 'Finish' : '完成'}
                </button>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  };

  // 渲染其他问卷的函数
  const renderOtherQuestionnaire = (questions: Question[]) => {
    return (
      <div className="questionnaire-content other-questionnaire" lang={language}>
        {/* Progress bar */}
        <div className="question-progress-container">
          <div className="question-progress-bar">
            <div 
              className="question-progress-fill" 
              style={{ width: `${calculatedQuestionnaireProgress()}%` }}
            ></div>
          </div>
        </div>
        
        {/* 其他问卷分页内容 */}
        {
          showFirstPage ? (
            // 第1页: ID 1-11，标题"I. About Professional Work / 关于职业工作"
            <div className="first-page-questions first-page-true">
              <h1 className="section-title">
                {language === 'en' 
                  ? 'I. About Professional Work' 
                  : 'I. 关于职业工作'}
              </h1>
              
              {questions.slice(0, 11).map((question) => (
                <div key={question.id} className="question-container">
                  {renderQuestionText(question)}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="answer-options">
                      {question.options?.map(option => (
                        <div 
                          key={option.id}
                          className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                        >
                          <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                    </div>
                  )}
                  
                  {question.type === 'scale-question' && (
                    <div className="scale-question-container">
                      <div className="scale-labels-wrapper">
                        <div className="scale-extreme-labels">
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                        </div>
                        <div className="scale-options">
                          {['1', '2', '3', '4', '5'].map((value) => (
                            <div 
                              key={value}
                              className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                              onClick={() => handleScaleAnswer(question.id, value)}
                            >
                              <div className="scale-circle"></div>
                              <span className="scale-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="question-navigation">
                <button 
                  className="nav-button next-button"
                  onClick={() => {
                    setShowFirstPage(false);
                    setShowSecondPage(true);
                  }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 1 && parseInt(id) <= 11).length < 11}
                >
                  {language === 'en' ? 'Continue' : '继续'}
                </button>
              </div>
            </div>
          ) : showSecondPage ? (
            // 第2页: ID 12-26，标题"II. About Us / 关于我们"
            <div className="first-page-questions">
              <h1 className="section-title">
                {language === 'en' 
                  ? 'II. About Us' 
                  : 'II. 关于我们'}
              </h1>
              
              {questions.slice(11, 26).map((question) => (
                <div key={question.id} className="question-container">
                  {renderQuestionText(question)}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="answer-options">
                      {question.options?.map(option => (
                        <div 
                          key={option.id}
                          className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                        >
                          <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                    </div>
                  )}
                  
                  {question.type === 'scale-question' && (
                    <div className="scale-question-container">
                      <div className="scale-labels-wrapper">
                        <div className="scale-extreme-labels">
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                        </div>
                        <div className="scale-options">
                          {['1', '2', '3', '4', '5'].map((value) => (
                            <div 
                              key={value}
                              className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                              onClick={() => handleScaleAnswer(question.id, value)}
                            >
                              <div className="scale-circle"></div>
                              <span className="scale-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="question-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={() => {
                    setShowSecondPage(false);
                    setShowFirstPage(true);
                  }}
                >
                  {language === 'en' ? 'Back' : '返回'}
                </button>
                
                <button 
                  className="nav-button next-button"
                  onClick={() => {
                    setShowSecondPage(false);
                    setShowThirdPage(true);
                  }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 12 && parseInt(id) <= 26).length < 15}
                >
                  {language === 'en' ? 'Continue' : '继续'}
                </button>
              </div>
            </div>
          ) : showThirdPage ? (
            // 第3页: ID 27-37，标题"III. About Motherhood / 关于母亲"
            <div className="first-page-questions">
              <h1 className="section-title">
                {language === 'en' 
                  ? 'III. About Motherhood' 
                  : 'III. 关于母亲'}
              </h1>
              
              {questions.slice(26, 37).map((question) => (
                <div key={question.id} className="question-container">
                  {renderQuestionText(question)}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="answer-options">
                      {question.options?.map(option => (
                        <div 
                          key={option.id}
                          className={`answer-option ${getCurrentAnswers()[question.id] === option.id ? 'selected' : ''}`}
                          onClick={() => handleMultipleChoiceAnswer(question.id, option.id)}
                        >
                          <p>{option.id}) {language === 'en' ? option.textEn : option.textZh}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text-input' && (
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="text-answer-input"
                        value={getCurrentAnswers()[question.id] || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                      />
                    </div>
                  )}
                  
                  {question.type === 'scale-question' && (
                    <div className="scale-question-container">
                      <div className="scale-labels-wrapper">
                        <div className="scale-extreme-labels">
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.minEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.minZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                          <span className="scale-extreme-label">
                            {language === 'en' 
                              ? question.scaleLabels?.maxEn.split(' – ').map((part, i) => <span key={i}>{part}</span>) 
                              : question.scaleLabels?.maxZh.split(' – ').map((part, i) => <span key={i}>{part}</span>)}
                          </span>
                        </div>
                        <div className="scale-options">
                          {['1', '2', '3', '4', '5'].map((value) => (
                            <div 
                              key={value}
                              className={`scale-option ${getCurrentAnswers()[question.id] === value ? 'selected' : ''}`}
                              onClick={() => handleScaleAnswer(question.id, value)}
                            >
                              <div className="scale-circle"></div>
                              <span className="scale-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="question-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={() => {
                    setShowThirdPage(false);
                    setShowSecondPage(true);
                  }}
                >
                  {language === 'en' ? 'Back' : '返回'}
                </button>
                
                <button 
                  className="nav-button finish-button"
                  onClick={() => {
                    // 计算结果并跳转到结果页面
                    finishQuestionnaire();
                  }}
                  disabled={Object.keys(getCurrentAnswers()).filter(id => parseInt(id) >= 27 && parseInt(id) <= 37).length < 11}
                >
                  {language === 'en' ? 'Finish' : '完成'}
                </button>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  };

  // 完成问卷并跳转到结果页面的函数
  const finishQuestionnaire = () => {
    // 计算结果并保存
    calculateTagResults();
    
    // 跳转到结果页面
    navigate('/results');
  };

  return (
    <main className={containerClass} lang={language}>
      <MetaTags />
      
      {showSaveIndicator && (
        <div className="save-indicator">
          {language === 'en' ? 'Progress saved' : '进度已保存'}
        </div>
      )}
      
      {/* 只为非母亲问卷页面显示背景 */}
      {step !== 'privacy' && step !== 'questionnaire' && (
        <>
          <div className="molecule-background"></div>
          <div className="hexagon-pattern"></div>
        </>
      )}
      
      {/* Show exit button at the top left corner for questionnaire and privacy screens */}
      {(step === 'privacy' || step === 'questionnaire') && exitButton}
      
      {step === 'intro' && renderIntroContent()}
      
      {step === 'privacy' && renderPrivacyStatement()}
      
      {step === 'questionnaire' && renderQuestionnaireContent()}
      
      {step === 'identity' && (
        <div className="identity-selection" lang={language}>
          <h1 className="identity-title" lang={language}>{t.personalityTest.identity.title}</h1>
          
          <div 
            className={`identity-option mother ${isIdentitySelected('mother') ? 'selected' : ''}`}
            onClick={() => handleIdentitySelect('mother')}
            lang={language}
          >
            <p lang={language}>{t.personalityTest.identity.mother}</p>
          </div>
          
          <div 
            className={`identity-option corporate ${isIdentitySelected('corporate') ? 'selected' : ''}`}
            onClick={() => handleIdentitySelect('corporate')}
            lang={language}
          >
            <p lang={language}>
              {(language === 'en' 
                ? `Founder / Board Member /
C-Suite Executive / President / Managing Director / Partner /
Vice President / Director / Senior Manager`
                : `创始人 / 董事会成员 /
首席执行官 / 总裁 / 董事总经理 / 合伙人 /
副总裁 / 总监 / 高级经理`
              ).split('\n').map((line, index, arr) => (
                <React.Fragment key={index}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
          
          <div 
            className={`identity-option other ${isIdentitySelected('other') ? 'selected' : ''}`}
            onClick={() => handleIdentitySelect('other')}
            lang={language}
          >
            <p lang={language}>{t.personalityTest.identity.other}</p>
          </div>

          <button 
            className="continue-button"
            onClick={handleContinue}
            disabled={selectedIdentities.size === 0}
            lang={language}
          >
            {language === 'en' ? 'CONTINUE →' : '继续 →'}
          </button>
        </div>
      )}
      
      
      {/* Only show LanguageSelector when not in questionnaire or privacy screens */}
      {step !== 'privacy' && step !== 'questionnaire' && <LanguageSelector />}
    </main>
  );
};

export default PersonalityTest; 