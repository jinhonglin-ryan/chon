import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector.tsx';
import './PersonalityTest.css';

type IdentityType = 'mother' | 'corporate' | 'both' | 'other';
type TestStep = 'intro' | 'identity' | 'mother-privacy' | 'mother-questionnaire' | 'corporate-questionnaire';
type QuestionType = 'multiple-choice' | 'text-input' | 'scale-question';

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
}

interface PersonalityTestProps {
  onWhiteThemeChange?: (isWhite: boolean) => void;
  onHideUIChange?: (shouldHide: boolean) => void;
}

const PersonalityTest = ({ onWhiteThemeChange, onHideUIChange }: PersonalityTestProps) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<TestStep>('intro');
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [selectedIdentities, setSelectedIdentities] = useState<Set<IdentityType>>(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFirstPage, setShowFirstPage] = useState(true);
  const [showSecondPage, setShowSecondPage] = useState(false);
  const [showThirdPage, setShowThirdPage] = useState(false);
  const [showFourthPage, setShowFourthPage] = useState(false);
  const [showFifthPage, setShowFifthPage] = useState(false);
  const [showSixthPage, setShowSixthPage] = useState(false);
  const [showSeventhPage, setShowSeventhPage] = useState(false);
  const [showEighthPage, setShowEighthPage] = useState(false);
  const [showNinthPage, setShowNinthPage] = useState(false);
  const [showTenthPage, setShowTenthPage] = useState(false);
  const [showEleventhPage, setShowEleventhPage] = useState(false);
  const [showTwelfthPage, setShowTwelfthPage] = useState(false);
  const [showThirteenthPage, setShowThirteenthPage] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [agreePercentage, setAgreePercentage] = useState<number>(65);
  
  // Define the questions for the mother questionnaire
  const motherQuestions: Question[] = [
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
        maxEn: 'Very involved – fully engaged with previous social life from work',
        maxZh: '非常投入 – 仍然全身心投入'
      }
    },
    {
      id: 10,
      type: 'scale-question',
      textEn: 'How well does your work arrangement after pregnancy support your needs as a working mother?',
      textZh: '您怀孕后的工作安排对作为职场母亲的您有多大支持作用？',
      scaleLabels: {
        minEn: 'Not supportive at all',
        minZh: '完全不支持',
        maxEn: 'Extremely supportive – fully meets my needs',
        maxZh: '非常支持 – 完全满足我的需求'
      }
    },
    {
      id: 11,
      type: 'scale-question',
      textEn: 'How connected do you feel to your professional identity since becoming a mother?',
      textZh: '自成为母亲后，您对自己的职业身份感有多强？',
      scaleLabels: {
        minEn: 'Not connected at all – motherhood has taken full priority',
        minZh: '完全不强 – 母亲角色优先于职业身份',
        maxEn: 'Very connected – strongly identify with my profession',
        maxZh: '非常强 – 依然非常认同自己的职业身份'
      }
    },
    {
      id: 12,
      type: 'scale-question',
      textEn: 'How has motherhood impacted your career progression or promotion opportunities?',
      textZh: '母亲身份对您的职业发展或晋升机会有何影响？',
      scaleLabels: {
        minEn: 'Very negative impact – significantly hindered career growth',
        minZh: '非常负面 – 明显阻碍了职业发展',
        maxEn: 'Very positive impact – enhanced my skills and opportunities',
        maxZh: '非常积极 – 提升了我的能力与机会'
      }
    },
    {
      id: 13,
      type: 'scale-question',
      textEn: 'How capable are you with the current support your employer provides in balancing work and motherhood?',
      textZh: '您如何评价运用公司提供的兼顾工作和育儿的支持的能力',
      scaleLabels: {
        minEn: 'Not supported at all',
        minZh: '完全不支持',
        maxEn: 'Extremely supported',
        maxZh: '非常支持 – 雇主非常包容和支持'
      }
    },
    {
      id: 14,
      type: 'scale-question',
      textEn: 'How has motherhood influenced your leadership or management style at work?',
      textZh: '母亲身份如何影响了您在工作中的领导或管理风格？',
      scaleLabels: {
        minEn: 'Negative – negatively affected my leadership style',
        minZh: '无提升 – 对管理风格产生负面影响',
        maxEn: 'Strongly improved – greatly enhanced my empathy and communication',
        maxZh: '显著提升 – 增强了我的领导能力'
      }
    },
    {
      id: 15,
      type: 'scale-question',
      textEn: 'How effective are you at managing work-related stress since becoming a mother?',
      textZh: '自成为母亲后，您应对工作压力的能力如何？',
      scaleLabels: {
        minEn: 'Much less effective – find it harder to manage stress now',
        minZh: '低很多 – 现在更难应对压力',
        maxEn: 'Much more effective – motherhood has strengthened my resilience',
        maxZh: '更有效 – 增强了我的韧性'
      }
    },
    {
      id: 16,
      type: 'scale-question',
      textEn: 'How motivated do you feel to pursue career growth since becoming a mother?',
      textZh: '自成为母亲后，您在职业发展方面的动力有多强？',
      scaleLabels: {
        minEn: 'Not motivated at all – currently not pursuing career growth',
        minZh: '完全没有 – 暂未追求职业发展',
        maxEn: 'Very motivated – even more driven to grow',
        maxZh: '非常强 – 动力更足'
      }
    },
    {
      id: 17,
      type: 'scale-question',
      textEn: 'How would your satisfaction level with your ability to maintain work-life balance be?',
      textZh: '您对您目前工作与生活平衡的能力感到满意吗？',
      scaleLabels: {
        minEn: 'Very dissatisfied – constant struggle',
        minZh: '非常不满意 – 时常感到困难',
        maxEn: 'Very satisfied – excellent balance',
        maxZh: '非常满意 – 平衡良好'
      }
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
      }
    },
    {
      id: 19,
      type: 'scale-question',
      textEn: 'How connected do you feel with other mothers through your work?',
      textZh: '您在工作中与其他母亲的联系如何？',
      scaleLabels: {
        minEn: 'Very disconnected – I don\'t have or look for such opportunities',
        minZh: '非常弱 – 没有也不寻找这类联系的机会',
        maxEn: 'Very connected – I have strong relationships and networks with other mothers at work',
        maxZh: '非常强 – 与其他职场母亲有紧密的关系和网络'
      }
    },
    {
      id: 20,
      type: 'scale-question',
      textEn: 'Are you actively seeking more opportunities to connect with other working mothers through your job?',
      textZh: '您是否主动在工作中寻求更多与其他职场母亲建立联系的机会？',
      scaleLabels: {
        minEn: 'Never – I am not interested in building these connections at work',
        minZh: '从不 – 我不打算在工作中建立这类联系',
        maxEn: 'Always – I prioritize creating these connections',
        maxZh: '经常 – 我很重视建立这样的联系'
      }
    },
    {
      id: 21,
      type: 'text-input',
      textEn: 'If you were the goddess of the business world and could change or create one thing about it, what would it be?',
      textZh: '如果您是商业世界的创造神，并且可以创造或改变任何一件事，您会改变什么？',
    },
    // Adding new questions about CHON
    {
      id: 22,
      type: 'scale-question',
      textEn: 'How well do you think enhanced abstract logical thinking would address emotional and life concerns?',
      textZh: '您认为加强抽象逻辑思维对解决情感和生活问题有多大帮助？',
      scaleLabels: {
        minEn: 'Not well at all – no link with emotions',
        minZh: '完全不行 – 与情感和生活毫无关联',
        maxEn: 'Extremely well – enhances objective processing of emotions',
        maxZh: '非常好 – 增强情绪客观处理'
      }
    },
    {
      id: 23,
      type: 'scale-question',
      textEn: 'To what extent do you believe that true self-love and the ability to care for others require strong objective reasoning to navigate challenges in life?',
      textZh: '你认为真正的自爱和关爱他人的能力在多大程度上需要强大的客观思维来解决生活中的挑战？',
      scaleLabels: {
        minEn: 'Strongly disagree – objective reasoning is not needed',
        minZh: '强烈不同意 – 理性毫无必要',
        maxEn: 'Strongly agree – reasoning is essential for care',
        maxZh: '强烈同意 – 理性至关重要'
      }
    },
    {
      id: 24,
      type: 'scale-question',
      textEn: 'How valuable do you find having a professional page within the app to showcase your previous work?',
      textZh: '您觉得在应用内拥有一个用于展示以往工作的职业页面有多大价值？',
      scaleLabels: {
        minEn: 'Not valuable at all – not relevant to me',
        minZh: '完全没有价值 – 我完全不在乎',
        maxEn: 'Extremely valuable – essential for maintaining my professional brand',
        maxZh: '非常有价值 – 对我的职业形象至关重要'
      }
    },
    {
      id: 25,
      type: 'scale-question',
      textEn: 'How likely are you to use this app to share completed projects or achievements for deal sourcing or client acquisition?',
      textZh: '您有多大可能使用该应用分享完成的商业项目或工作成就，以寻找合作机会或获取客户？',
      scaleLabels: {
        minEn: 'Very unlikely – not interested in using it for this purpose',
        minZh: '完全不可能 – 不打算用它做这方面的事',
        maxEn: 'Very likely – I would regularly post updates and projects',
        maxZh: '非常可能 – 我会定期发布更新和项目'
      }
    },
    {
      id: 26,
      type: 'scale-question',
      textEn: 'How helpful would connecting your professional page with other career platforms be for enhancing collaboration or finding project opportunities?',
      textZh: '如果可以将您的职业页面与其他职业发展平台连接，提升合作或寻找项目机会，这对您来说有多大帮助？',
      scaleLabels: {
        minEn: 'Not helpful at all – would not use this feature',
        minZh: '完全没有用 – 不会使用该功能',
        maxEn: 'Extremely helpful – cross-platform exposure is crucial for me',
        maxZh: '非常有用 – 跨平台曝光对我至关重要'
      }
    },
    {
      id: 27,
      type: 'scale-question',
      textEn: 'How likely are you to use the forum to connect with other mothers for emotional or medical support?',
      textZh: '您有多大可能使用该论坛与其他母亲建立联系，获取情感或医疗方面的支持？',
      scaleLabels: {
        minEn: 'Very unlikely – I would not use the forum',
        minZh: '完全不可能 – 不会使用该论坛',
        maxEn: 'Very likely – I would actively seek and offer support',
        maxZh: '非常可能 – 我会积极寻求并提供支持'
      }
    },
    {
      id: 28,
      type: 'scale-question',
      textEn: 'How valuable do you think this forum could be in helping you feel less isolated as a working mother?',
      textZh: '您认为该论坛在帮助您增进作为职场母亲与别人连接方面有多大价值？',
      scaleLabels: {
        minEn: 'Not valuable at all – wouldn\'t affect me',
        minZh: '完全没有价值 – 对我没有影响',
        maxEn: 'Extremely valuable – would make a big difference',
        maxZh: '非常有价值 – 能带来很大改变'
      }
    },
    {
      id: 29,
      type: 'scale-question',
      textEn: 'How motivated are you to use visuospatial and logical training modules within the app to strengthen abstract cognitive skills?',
      textZh: '您有多大动力使用应用内的视觉空间和逻辑训练模块？',
      scaleLabels: {
        minEn: 'Not motivated at all – wouldn\'t use these modules',
        minZh: '完全没有动力 – 不会使用这些模块',
        maxEn: 'Very motivated – would use them regularly',
        maxZh: '非常有动力 – 我会经常使用'
      }
    },
    {
      id: 30,
      type: 'scale-question',
      textEn: 'How helpful do you think cognitive training would be in enhancing your problem-solving abilities?',
      textZh: '您认为抽象逻辑训练对提升您解决问题的能力有多大帮助？',
      scaleLabels: {
        minEn: 'Not helpful at all – unrelated to my needs',
        minZh: '完全无帮助 – 与我的需求无关',
        maxEn: 'Extremely helpful – would improve key skills',
        maxZh: '非常有帮助 – 能显著提升关键能力'
      }
    },
    {
      id: 31,
      type: 'scale-question',
      textEn: 'How engaging do you think it would be to create and interact with a self-designed electronic child avatar in your personal profile?',
      textZh: '您觉得在个人主页中创建并与自定义的"电子小孩"虚拟形象互动的这个功能有多大吸引力？',
      scaleLabels: {
        minEn: 'Not engaging at all – wouldn\'t use this feature',
        minZh: '完全无吸引力 – 不会使用这个功能',
        maxEn: 'Very engaging – a fun and meaningful feature',
        maxZh: '非常有吸引力 – 是一个有趣且有意义的功能'
      }
    },
    {
      id: 32,
      type: 'scale-question',
      textEn: 'How important is personalization (e.g., avatar design, profile customization) in keeping you engaged with an app?',
      textZh: '在提高您对一款工作效率类应用的粘性方面，个性化（如虚拟形象设计、个人主页定制）对您有多重要？',
      scaleLabels: {
        minEn: 'Not important at all – does not matter to me',
        minZh: '完全不重要 – 对我无关紧要',
        maxEn: 'Very important – strongly affects my engagement',
        maxZh: '非常重要 – 极大影响我的使用体验'
      }
    },
    {
      id: 33,
      type: 'scale-question',
      textEn: 'How do you feel about requiring you to submit a confidential child health-related record to verify that you and other users are active caregivers?',
      textZh: '您如何看待要求您在使用本应用程序之前提交与儿童健康相关的保密记录，以证实您是孩子的照顾者？',
      scaleLabels: {
        minEn: 'Strongly oppose – requirement is utterly invasive indeed',
        minZh: '强烈反对 - 不可接受，侵入性太强',
        maxEn: 'Strongly support – requirement ensures safety and trust',
        maxZh: '强烈支持 - 这对安全和信任至关重要'
      }
    },
    {
      id: 34,
      type: 'scale-question',
      textEn: 'Do you believe misuse by unintended users (including your partner accessing accounts without permission) could negatively affect trust in the app?',
      textZh: '您认为如果有非目标用户滥用该平台（包括您的生活伴侣未经允许访问账户等情况），是否会对用户对本应用的信任度产生负面影响？',
      scaleLabels: {
        minEn: 'Definitely no – misuse poses no trust risk',
        minZh: '绝对不会',
        maxEn: 'Definitely yes – misuse severely undermines overall trust',
        maxZh: '绝对会'
      }
    },
    {
      id: 35,
      type: 'scale-question',
      textEn: 'How do you feel about your company occasionally verifying through HR that business updates and activities posted on this platform are genuinely by yourself and other mother users, not others misusing their accounts?',
      textZh: '您如何看待由公司人力资源部门核查平台上的业务更新和动态确实由目标用户本人发布，而非他人滥用账户？',
      scaleLabels: {
        minEn: 'Strongly oppose – Feels like micromanagement',
        minZh: '强烈反对 – 感觉像被过度监管',
        maxEn: 'Strongly support – It would ensure professional integrity and security',
        maxZh: '非常支持 – 能有效保障专业性和安全性'
      }
    },
    // About Motherhood section questions (36-40)
    {
      id: 36,
      type: 'scale-question',
      textEn: 'How prepared did you feel for motherhood before becoming a mother?',
      textZh: '在成为母亲之前，您觉得自己对母亲这一角色的准备程度如何？',
      scaleLabels: {
        minEn: 'Not prepared at all – felt completely unprepared',
        minZh: '完全没有准备 – 感到毫无准备',
        maxEn: 'Very prepared – had a clear understanding and plan',
        maxZh: '非常充分 – 有清晰的理解和计划'
      }
    },
    {
      id: 37,
      type: 'scale-question',
      textEn: 'How much has motherhood changed your personal values or priorities?',
      textZh: '母亲身份对您的个人价值观或人生优先事项改变有多大？',
      scaleLabels: {
        minEn: 'No change – my values and priorities stayed the same',
        minZh: '没有改变 – 价值观和优先事项保持不变',
        maxEn: 'Completely changed – my priorities are entirely different',
        maxZh: '完全改变 – 优先事项完全不同'
      }
    },
    {
      id: 38,
      type: 'scale-question',
      textEn: 'How supported do you feel by your family or community in your motherhood journey?',
      textZh: '在做母亲的过程中，您觉得家人或社群对您的支持程度如何？',
      scaleLabels: {
        minEn: 'Not supported at all – no reliable support system',
        minZh: '完全没有支持 – 缺乏可靠的支持系统',
        maxEn: 'Extremely supported – strong network of support',
        maxZh: '非常支持 – 有强大的支持网络'
      }
    },
    {
      id: 39,
      type: 'scale-question',
      textEn: 'How confident are you in your ability to balance motherhood with your personal goals (e.g., hobbies, self-care)?',
      textZh: '您在平衡母亲角色与个人目标方面有多大信心？',
      scaleLabels: {
        minEn: 'Not confident at all – difficult to focus on personal goals',
        minZh: '完全没有信心 – 无法兼顾个人目标',
        maxEn: 'Very confident – consistently manage both well',
        maxZh: '非常有信心 – 始终能够良好平衡'
      }
    },
    {
      id: 40,
      type: 'scale-question',
      textEn: 'How much emotional fulfillment has motherhood brought to your life?',
      textZh: '母亲身份为您的生活带来了多少情感满足感？',
      scaleLabels: {
        minEn: 'Not fulfilling at all – rarely feel emotional satisfaction',
        minZh: '完全不满足 – 很少有情感上的满足感',
        maxEn: 'Extremely fulfilling – deeply enriching',
        maxZh: '非常满足 – 极大丰富了我的生活'
      }
    },
    // Additional motherhood questions for tenth page (41-46)
    {
      id: 41,
      type: 'scale-question',
      textEn: 'How much do you feel that motherhood has made you more resilient or emotionally strong?',
      textZh: '母亲身份是否让您变得更有韧性或情绪更强大？',
      scaleLabels: {
        minEn: 'Much weaker – often feel less resilient',
        minZh: '明显减弱 – 常常感到缺乏韧性',
        maxEn: 'Much stronger – significantly built my resilience',
        maxZh: '显著增强 – 极大提升了我的韧性'
      }
    },
    {
      id: 42,
      type: 'scale-question',
      textEn: 'How has motherhood affected your ability to set boundaries (e.g., with work, family, or friends) in life?',
      textZh: '母亲身份对您设定边界（如与工作、家庭或朋友）能力的影响如何？',
      scaleLabels: {
        minEn: 'Significantly weakened – rarely able to set boundaries',
        minZh: '显著减弱 – 几乎无法设定边界',
        maxEn: 'Improved greatly – much better at setting boundaries',
        maxZh: '显著提升 – 更善于划定边界'
      }
    },
    {
      id: 43,
      type: 'scale-question',
      textEn: 'How often do you feel pressure to meet external expectations of motherhood (e.g., societal, cultural, or family expectations)?',
      textZh: '您多久感受到来自外界对母亲角色（如社会、文化或家庭）的期待压力？',
      scaleLabels: {
        minEn: 'Never – do not feel this pressure at all',
        minZh: '从不 – 完全不受这些压力影响',
        maxEn: 'Always – constantly feel this pressure',
        maxZh: '总是 – 时刻感到压力'
      }
    },
    {
      id: 44,
      type: 'scale-question',
      textEn: 'How satisfied are you with the balance between your motherhood role and your sense of self outside of being a mother?',
      textZh: '您对母亲角色与自我身份（作为母亲之外的自我）之间的平衡感到多大满意？',
      scaleLabels: {
        minEn: 'Very dissatisfied – feel I\'ve lost my sense of self',
        minZh: '非常不满意 – 感到失去了自我',
        maxEn: 'Very satisfied – feel like both roles coexist well',
        maxZh: '非常满意 – 两者良好共存'
      }
    },
    {
      id: 45,
      type: 'scale-question',
      textEn: 'How important is it for you to connect with other mothers who share similar experiences?',
      textZh: '与有类似经历的其他母亲建立联系对您来说有多重要？',
      scaleLabels: {
        minEn: 'Not important at all – prefer to handle things independently',
        minZh: '完全不重要 – 更喜欢独立处理',
        maxEn: 'Extremely important – a key part of my support system',
        maxZh: '非常重要 – 是我重要的支持来源'
      }
    },
    {
      id: 46,
      type: 'scale-question',
      textEn: 'How much do you feel that your own mother\'s role influenced your early understanding of leadership or responsibility?',
      textZh: '您认为您的母亲在多大程度上影响了童年时期您对领导力或责任感的认知？',
      scaleLabels: {
        minEn: 'Not at all',
        minZh: '没有影响',
        maxEn: 'Very strongly',
        maxZh: '非常深远'
      }
    },
    // ... We can add the remaining questions here to reach a total of 46
  ];
  
  const progress = 65;
  const totalQuestions = 46; // Total number of questions
  
  // 从本地存储加载答案数据
  useEffect(() => {
    const savedAnswers = localStorage.getItem('chon_personality_answers');
    const savedStep = localStorage.getItem('chon_personality_step');
    const savedIdentities = localStorage.getItem('chon_personality_identities');
    const savedUserChoice = localStorage.getItem('chon_personality_user_choice');
    const savedQuestionIndex = localStorage.getItem('chon_personality_question_index');
    const savedShowFirstPage = localStorage.getItem('chon_personality_show_first_page');
    const savedShowSecondPage = localStorage.getItem('chon_personality_show_second_page');
    const savedShowThirdPage = localStorage.getItem('chon_personality_show_third_page');
    const savedShowFourthPage = localStorage.getItem('chon_personality_show_fourth_page');
    const savedShowFifthPage = localStorage.getItem('chon_personality_show_fifth_page');
    const savedShowSixthPage = localStorage.getItem('chon_personality_show_sixth_page');
    const savedShowSeventhPage = localStorage.getItem('chon_personality_show_seventh_page');
    const savedShowEighthPage = localStorage.getItem('chon_personality_show_eighth_page');
    const savedShowNinthPage = localStorage.getItem('chon_personality_show_ninth_page');
    const savedShowTenthPage = localStorage.getItem('chon_personality_show_tenth_page');
    const savedShowEleventhPage = localStorage.getItem('chon_personality_show_eleventh_page');
    const savedShowTwelfthPage = localStorage.getItem('chon_personality_show_twelfth_page');
    const savedShowThirteenthPage = localStorage.getItem('chon_personality_show_thirteenth_page');
    
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
    
    if (savedQuestionIndex) {
      setCurrentQuestionIndex(parseInt(savedQuestionIndex, 10));
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
    
    if (savedShowSixthPage) {
      setShowSixthPage(savedShowSixthPage === 'true');
    }
    
    if (savedShowSeventhPage) {
      setShowSeventhPage(savedShowSeventhPage === 'true');
    }
    
    if (savedShowEighthPage) {
      setShowEighthPage(savedShowEighthPage === 'true');
    }
    
    if (savedShowNinthPage) {
      setShowNinthPage(savedShowNinthPage === 'true');
    }
    
    if (savedShowTenthPage) {
      setShowTenthPage(savedShowTenthPage === 'true');
    }
    
    if (savedShowEleventhPage) {
      setShowEleventhPage(savedShowEleventhPage === 'true');
    }
    
    if (savedShowTwelfthPage) {
      setShowTwelfthPage(savedShowTwelfthPage === 'true');
    }
    
    if (savedShowThirteenthPage) {
      setShowThirteenthPage(savedShowThirteenthPage === 'true');
    }
  }, []);
  
  // 验证步骤值是否有效
  const isValidStep = (step: string): boolean => {
    return ['intro', 'identity', 'mother-privacy', 'mother-questionnaire', 'corporate-questionnaire'].includes(step);
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
    localStorage.setItem('chon_personality_question_index', currentQuestionIndex.toString());
    localStorage.setItem('chon_personality_show_first_page', showFirstPage.toString());
    localStorage.setItem('chon_personality_show_second_page', showSecondPage.toString());
    localStorage.setItem('chon_personality_show_third_page', showThirdPage.toString());
    localStorage.setItem('chon_personality_show_fourth_page', showFourthPage.toString());
    localStorage.setItem('chon_personality_show_fifth_page', showFifthPage.toString());
    localStorage.setItem('chon_personality_show_sixth_page', showSixthPage.toString());
    localStorage.setItem('chon_personality_show_seventh_page', showSeventhPage.toString());
    localStorage.setItem('chon_personality_show_eighth_page', showEighthPage.toString());
    localStorage.setItem('chon_personality_show_ninth_page', showNinthPage.toString());
    localStorage.setItem('chon_personality_show_tenth_page', showTenthPage.toString());
    localStorage.setItem('chon_personality_show_eleventh_page', showEleventhPage.toString());
    localStorage.setItem('chon_personality_show_twelfth_page', showTwelfthPage.toString());
    localStorage.setItem('chon_personality_show_thirteenth_page', showThirteenthPage.toString());
  }, [currentQuestionIndex, showFirstPage, showSecondPage, showThirdPage, showFourthPage, showFifthPage, showSixthPage, showSeventhPage, showEighthPage, showNinthPage, showTenthPage, showEleventhPage, showTwelfthPage, showThirteenthPage]);

  // Update white theme state when step changes
  useEffect(() => {
    if (onWhiteThemeChange) {
      const isWhiteTheme = step === 'mother-questionnaire' || step === 'mother-privacy';
      onWhiteThemeChange(isWhiteTheme);
      
      // 对于荷尔蒙问题页面，使用不同的背景图片
      if (isWhiteTheme && (showEleventhPage || showTwelfthPage || showThirteenthPage)) {
        const styleEl = document.createElement('style');
        styleEl.id = 'hormone-style';
        styleEl.textContent = `
          .white-theme::after {
            background-image: url('/images/molecule_white_after.jpg') !important;
          }
        `;
        // 确保之前的样式被移除
        const existingStyle = document.getElementById('hormone-style');
        if (existingStyle) {
          existingStyle.remove();
        }
        document.head.appendChild(styleEl);
      } else {
        // 恢复正常透明度，移除自定义样式
        const existingStyle = document.getElementById('hormone-style');
        if (existingStyle) {
          existingStyle.remove();
        }
      }
    }
    
    // 根据步骤决定是否隐藏UI元素
    if (onHideUIChange) {
      const shouldHideUI = step === 'mother-questionnaire' || step === 'mother-privacy';
      onHideUIChange(shouldHideUI);
    }
  }, [step, showEleventhPage, showTwelfthPage, showThirteenthPage, onWhiteThemeChange, onHideUIChange]);

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
  
  // 重置问题36的答案，确保没有预设值
  useEffect(() => {
    if (showNinthPage) {
      // 检查问题36是否有预设值，如果有则清除
      setAnswers(prev => {
        if (prev[36]) {
          console.log("发现问题36有预设值，正在清除:", prev[36]);
          const newAnswers = {...prev};
          delete newAnswers[36];
          return newAnswers;
        }
        return prev;
      });
    }
  }, [showNinthPage]);
  
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
      // Always go to mother privacy page regardless of selection
        setStep('mother-privacy');
    }
  };

  const handlePrivacyContinue = () => {
    // If mother is selected, go to mother questionnaire, otherwise go to corporate
    if (selectedIdentities.has('mother')) {
    setStep('mother-questionnaire');
    } else {
      setStep('corporate-questionnaire');
    }
  };

  const isIdentitySelected = (identity: IdentityType): boolean => {
    return selectedIdentities.has(identity);
  };

  // Handle answer selection for multiple choice questions
  const handleMultipleChoiceAnswer = (questionId: number, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Handle text input for free text questions
  const handleTextAnswer = (questionId: number, text: string) => {
    // Only update answer when there's text content
    if (text.trim()) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: text
      }));
    } else {
      // Remove the answer if text is empty to accurately track progress
      setAnswers(prev => {
        const newAnswers = {...prev};
        delete newAnswers[questionId];
        return newAnswers;
      });
    }
  };

  // Handle scale question answer
  const handleScaleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle navigation between questions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < motherQuestions.length - 5) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const renderQuestionnaireContent = () => {
    // This will be expanded based on the selected identities
    const roles = Array.from(selectedIdentities);
    
    // Calculate progress based on completed questions
    // Count number of questions answered
    const answeredQuestionsCount = Object.keys(answers).length;
    // Calculate progress percentage (starts from 0)
    const questionProgress = (answeredQuestionsCount / totalQuestions) * 100;

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
        
        {showFirstPage ? (
          // First page with four questions (1-4)
          <div className="first-page-questions">
            
            {motherQuestions.slice(0, 4).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${answers[question.id] === option.id ? 'selected' : ''}`}
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
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                      placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                    />
                  </div>
                )}
              </div>
            ))}
            
            <div className="first-page-navigation">
              <button 
                className="nav-button next-button first-page-continue"
                onClick={() => {
                  setShowFirstPage(false);
                  setShowSecondPage(true);
                }}
                disabled={!answers[1] || !answers[2] || !answers[3] || !answers[4]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showSecondPage ? (
          // Second page with four questions (5-8)
          <div className="first-page-questions">
            {motherQuestions.slice(4, 8).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${answers[question.id] === option.id ? 'selected' : ''}`}
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
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                      placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                    />
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
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowSecondPage(false);
                  setShowThirdPage(true);
                }}
                disabled={!answers[5] || !answers[6] || !answers[7] || !answers[8]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showThirdPage ? (
          // Third page with four questions about work-life balance (9-12)
          <div className="first-page-questions">
            <h1 className="section-title">
              {language === 'en' 
                ? 'I. About Work-Life Balance' 
                : 'I. 关于工作与生活的平衡'}
        </h1>
            
            {motherQuestions.slice(8, 12).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${answers[question.id] === option.id ? 'selected' : ''}`}
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
                      value={answers[question.id] || ''}
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
                            className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowThirdPage(false);
                  setShowFourthPage(true);
                }}
                disabled={!answers[9] || !answers[10] || !answers[11] || !answers[12]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showFourthPage ? (
          // Fourth page with five questions about motherhood and work (13-17)
          <div className="first-page-questions">
            {motherQuestions.slice(12, 17).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
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
                            className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowFourthPage(false);
                  setShowFifthPage(true);
                }}
                disabled={!answers[13] || !answers[14] || !answers[15] || !answers[16] || !answers[17]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showFifthPage ? (
          // Fifth page with questions about networking with mothers (18-21)
          <div className="first-page-questions">
            {motherQuestions.slice(17, 21).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
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
                            className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                
                {question.type === 'text-input' && (
                  <div className="text-input-container">
                    <input
                      type="text"
                      className="text-answer-input"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                      placeholder={language === 'en' ? 'Enter your answer here' : '在此输入您的答案'}
                    />
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
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowFifthPage(false);
                  setShowSixthPage(true);
                }}
                disabled={!answers[18] || !answers[19] || !answers[20] || !answers[21]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showSixthPage ? (
          // Sixth page - About Us, CHON questions (22-26)
          <div className="first-page-questions">
            <h1 className="section-title">
              {language === 'en' 
                ? 'II. About Us, CHON' 
                : 'II. 关于我们'}
            </h1>
            
            {motherQuestions.slice(21, 26).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
                {question.type === 'multiple-choice' && (
                  <div className="answer-options">
                    {question.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`answer-option ${answers[question.id] === option.id ? 'selected' : ''}`}
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
                      value={answers[question.id] || ''}
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
                            className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                  setShowSixthPage(false);
                  setShowFifthPage(true);
                }}
              >
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowSixthPage(false);
                  setShowSeventhPage(true);
                }}
                disabled={!answers[22] || !answers[23] || !answers[24] || !answers[25] || !answers[26]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showSeventhPage ? (
          // Seventh page - Forum and cognitive training questions (27-31)
          <div className="first-page-questions">
            
            {motherQuestions.slice(26, 31).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
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
                            className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                  setShowSeventhPage(false);
                  setShowSixthPage(true);
                }}
              >
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowSeventhPage(false);
                  setShowEighthPage(true);
                }}
                disabled={!answers[27] || !answers[28] || !answers[29] || !answers[30] || !answers[31]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showEighthPage ? (
          // Eighth page - Security and personalization questions (32-35)
          <div className="first-page-questions">
            {motherQuestions.slice(31, 36).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
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
                            className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                  setShowEighthPage(false);
                  setShowSeventhPage(true);
                }}
              >
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  // 在显示第九页前清除问题36的答案
                  setAnswers(prev => {
                    const newAnswers = {...prev};
                    delete newAnswers[36];
                    return newAnswers;
                  });
                  
                  setShowEighthPage(false);
                  setShowNinthPage(true);
                }}
                disabled={!answers[32] || !answers[33] || !answers[34] || !answers[35]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showNinthPage ? (
          (() => {
            // 调试输出，查看问题36的值
            console.log("Debug Question 36 value:", answers[36]);
            console.log("Debug all Answers:", answers);
            
            return (
              <div className="first-page-questions">
                <h1 className="section-title">
                  {language === 'en' 
                    ? 'III. About Motherhood' 
                    : 'III. 关于母亲身份'}
                </h1>
                
                {motherQuestions.slice(35, 40).map((question) => (
                  <div key={question.id} className="question-container">
                    <h2 className="question-text">
                      {language === 'en' ? question.textEn : question.textZh}
                    </h2>
                    
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
                                className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                      setShowNinthPage(false);
                      setShowEighthPage(true);
                    }}
                  >
                    {language === 'en' ? 'Previous Page' : '上一页'}
                  </button>
                  
                  <button 
                    className="nav-button next-button"
                    onClick={() => {
                      setShowNinthPage(false);
                      setShowTenthPage(true);
                    }}
                    disabled={!answers[36] || !answers[37] || !answers[38] || !answers[39] || !answers[40]}
                  >
                    {language === 'en' ? 'Continue' : '继续'}
                  </button>
                </div>
              </div>
            );
          })()
        ) : showTenthPage ? (
          // Tenth page - Additional motherhood questions (41-46)
          <div className="first-page-questions">
            {motherQuestions.slice(40, 46).map((question) => (
              <div key={question.id} className="question-container">
                <h2 className="question-text">
                  {language === 'en' ? question.textEn : question.textZh}
                </h2>
                
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
                            className={`scale-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                  // 当用户从第十页返回第九页时也清除问题36的答案
                  setAnswers(prev => {
                    const newAnswers = {...prev};
                    delete newAnswers[36];
                    return newAnswers;
                  });
                  
                  setShowTenthPage(false);
                  setShowNinthPage(true);
                }}
              >
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowTenthPage(false);
                  setShowEleventhPage(true);
                }}
                disabled={!answers[41] || !answers[42] || !answers[43] || !answers[44] || !answers[45] || !answers[46]}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showEleventhPage ? (
          // 荷尔蒙相关问题页面 - 第一页
          <div className="first-page-questions hormone-questions" style={{ 
            position: 'relative', 
            zIndex: 5, 
            width: '50%', 
            maxWidth: '500px', 
            margin: '0 auto 0 5%', // 左对齐而非居中
            backgroundColor: 'rgba(255, 255, 255, 0.5)', // 降低背景不透明度
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div className="question-container" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
              <h2 className="question-text" style={{ color: '#333', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {language === 'en' 
                  ? 'What hormone is this?' 
                  : '请问这是身体中的什么激素？'}
              </h2>
              
              <div className="answer-options">
                <div 
                  className={`answer-option ${answers[47] === 'cortisol' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(47, 'cortisol')}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: answers[47] === 'cortisol' ? '#F0BDC0' : '#f9f9f9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: answers[47] === 'cortisol' ? '1px solid #e3a6a9' : '1px solid #eee'
                  }}
                >
                  <p style={{ 
                    margin: 0, 
                    color: answers[47] === 'cortisol' ? 'white' : '#333',
                    fontWeight: answers[47] === 'cortisol' ? 'bold' : 'normal'
                  }}>{language === 'en' ? 'cortisol' : '皮质醇'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[47] === 'dopamine' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(47, 'dopamine')}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: answers[47] === 'dopamine' ? '#F0BDC0' : '#f9f9f9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: answers[47] === 'dopamine' ? '1px solid #e3a6a9' : '1px solid #eee'
                  }}
                >
                  <p style={{ 
                    margin: 0, 
                    color: answers[47] === 'dopamine' ? 'white' : '#333',
                    fontWeight: answers[47] === 'dopamine' ? 'bold' : 'normal'
                  }}>{language === 'en' ? 'dopamine' : '多巴胺'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[47] === 'oxytocin' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(47, 'oxytocin')}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: answers[47] === 'oxytocin' ? '#F0BDC0' : '#f9f9f9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: answers[47] === 'oxytocin' ? '1px solid #e3a6a9' : '1px solid #eee'
                  }}
                >
                  <p style={{ 
                    margin: 0, 
                    color: answers[47] === 'oxytocin' ? 'white' : '#333',
                    fontWeight: answers[47] === 'oxytocin' ? 'bold' : 'normal'
                  }}>{language === 'en' ? 'oxytocin' : '催产素'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[47] === 'testosterone' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(47, 'testosterone')}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: answers[47] === 'testosterone' ? '#F0BDC0' : '#f9f9f9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: answers[47] === 'testosterone' ? '1px solid #e3a6a9' : '1px solid #eee'
                  }}
                >
                  <p style={{ 
                    margin: 0, 
                    color: answers[47] === 'testosterone' ? 'white' : '#333',
                    fontWeight: answers[47] === 'testosterone' ? 'bold' : 'normal'
                  }}>{language === 'en' ? 'testosterone' : '睾酮'}</p>
                </div>
              </div>
            </div>
            
            <div className="question-navigation" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '480px', margin: '20px 0 0 0' }}>
              <button 
                className="nav-button prev-button"
                onClick={() => {
                  setShowEleventhPage(false);
                  setShowTenthPage(true);
                }}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}
              >
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowEleventhPage(false);
                  setShowTwelfthPage(true);
                }}
                disabled={!answers[47]}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#F0BDC0', color: 'white', fontWeight: 'bold' }}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showTwelfthPage ? (
          // 荷尔蒙相关问题页面 - 第二页
          <div className="first-page-questions hormone-questions" style={{ 
            position: 'relative', 
            zIndex: 5, 
            width: '50%', 
            maxWidth: '500px', 
            margin: '0 auto 0 5%', // 左对齐而非居中
            backgroundColor: 'rgba(255, 255, 255, 0.5)', // 降低背景不透明度
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div className="question-container" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
              <h2 className="question-text" style={{ color: '#333', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {language === 'en' 
                  ? 'What function is it associated with?' 
                  : '它和身体的什么功能相关？'}
              </h2>
              
              <div className="answer-options">
                <div 
                  className={`answer-option ${answers[48] === 'stress' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(48, 'stress')}
                >
                  <p>{language === 'en' 
                    ? 'Stress response & Immune system' 
                    : '应激反应&免疫功能'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[48] === 'motivation' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(48, 'motivation')}
                >
                  <p>{language === 'en' 
                    ? 'Motivation & Pleasure' 
                    : '动机&愉悦'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[48] === 'empathy' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(48, 'empathy')}
                >
                  <p>{language === 'en' 
                    ? 'Empathy & Stress reduction' 
                    : '共情&减压'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[48] === 'competitiveness' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(48, 'competitiveness')}
                >
                  <p>{language === 'en' 
                    ? 'Competitiveness & Risk-taking behavior' 
                    : '竞争力&冒险行为'}</p>
                </div>
              </div>
            </div>
            
            <div className="question-navigation" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '480px', margin: '20px 0 0 0' }}>
              <button 
                className="nav-button prev-button"
                onClick={() => {
                  setShowTwelfthPage(false);
                  setShowEleventhPage(true);
                }}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}
              >
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                onClick={() => {
                  setShowTwelfthPage(false);
                  setShowThirteenthPage(true);
                }}
                disabled={!answers[48]}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#F0BDC0', color: 'white', fontWeight: 'bold' }}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : showThirteenthPage ? (
          // 荷尔蒙相关问题页面 - 第三页
          <div className="first-page-questions hormone-questions" style={{ 
            position: 'relative', 
            zIndex: 5, 
            width: '50%', 
            maxWidth: '500px', 
            margin: '0 auto 0 5%', // 左对齐而非居中
            backgroundColor: 'rgba(255, 255, 255, 0.5)', // 降低背景不透明度
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div className="question-container" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
              <h2 className="question-text" style={{ color: '#333', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {language === 'en' 
                  ? 'Under what circumstances is it secreted?' 
                  : '它是在什么情况下分泌的？'}
              </h2>
              
              <div className="answer-options">
                <div 
                  className={`answer-option ${answers[49] === 'stress' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(49, 'stress')}
                >
                  <p>{language === 'en' ? 'Stress' : '压力'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[49] === 'rewards' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(49, 'rewards')}
                >
                  <p>{language === 'en' ? 'Rewards & Novelty' : '奖励&新颖'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[49] === 'love' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(49, 'love')}
                >
                  <p>{language === 'en' ? 'Love & Social Bonding' : '爱&社会联系'}</p>
                </div>
                <div 
                  className={`answer-option ${answers[49] === 'competition' ? 'selected' : ''}`}
                  onClick={() => handleMultipleChoiceAnswer(49, 'competition')}
                >
                  <p>{language === 'en' ? 'Competition & Dominance' : '竞争&统治'}</p>
                </div>
              </div>
            </div>
            
            <div className="question-navigation" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '480px', margin: '20px 0 0 0' }}>
              <button 
                className="nav-button prev-button"
                onClick={() => {
                  setShowThirteenthPage(false);
                  setShowTwelfthPage(true);
                }}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}
              >
                {language === 'en' ? 'Previous Page' : '上一页'}
              </button>
              
              <button 
                className="nav-button next-button"
                // Navigate to results page
                disabled={!answers[49]}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#F0BDC0', color: 'white', fontWeight: 'bold' }}
              >
                {language === 'en' ? 'Continue' : '继续'}
              </button>
            </div>
          </div>
        ) : (
          <div></div> // Placeholder for any other case
        )}
      </div>
    );
  };

  const renderMotherPrivacyStatement = () => {
    return (
      <div className="privacy-statement mother-privacy" lang={language}>
        <p className="privacy-text" lang={language}>
          {language === 'en' 
            ? "Your information will only be used for verification purposes and to formulate your CHON personality test. It will not be shared, disclosed, or used for any other purpose. We value your honesty and are committed to protecting your privacy and ensuring the security of your data."
            : "您的信息将仅用于验证目的和制定您的 CHON 性格测试。您的信息不会被共享、披露或用于任何其他目的。我们重视您的诚实，并承诺保护您的隐私，确保您的数据安全。"
          }
        </p>
        <button 
          className="privacy-continue mother-continue"
          onClick={handlePrivacyContinue}
          lang={language}
        >
          {language === 'en' ? 'CONTINUE' : '继续'}
        </button>
      </div>
    );
  };

  const wrappedQuestion = `<span lang="${language}">${t.intro.question}</span>`;

  // Exit button that appears only on questionnaire and privacy screens
  const exitButton = (
    <div className="exit-actions">
      <Link to="/" className="exit-button" lang={language}>
        {language === 'en' ? 'Exit' : '退出'} ←
      </Link>
    </div>
  );

  // Only white theme steps should have no-header class
  const containerClass = step === 'mother-questionnaire' || step === 'mother-privacy' 
    ? 'personality-test-container no-header' 
    : 'personality-test-container';

  // 计算问卷进度
  const calculatedQuestionnaireProgress = () => {
    if (!userChoice) return 0;

    // 计算总问题数量 - 更新为包括荷尔蒙问题
    const totalQuestionsInTest = motherQuestions.length + 3; // 添加最后三个额外问题
    
    // 已回答的问题数量 
    const answeredCount = Object.keys(answers).length;
    
    // 计算完成百分比
    return (answeredCount / totalQuestionsInTest) * 100;
  };

  // 在intro页面确保显示问题和选项
  const renderIntroContent = () => {
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

  return (
    <main className={containerClass} lang={language}>
      {showSaveIndicator && (
        <div className="save-indicator">
          {language === 'en' ? 'Progress saved' : '进度已保存'}
        </div>
      )}
      
      {/* 只为非母亲问卷页面显示背景 */}
      {step !== 'mother-questionnaire' && step !== 'mother-privacy' && (
        <>
          <div className="molecule-background"></div>
          <div className="hexagon-pattern"></div>
        </>
      )}
      
      {step === 'intro' && renderIntroContent()}
      
      {step === 'mother-privacy' && renderMotherPrivacyStatement()}
      
      {step === 'mother-questionnaire' && renderQuestionnaireContent()}
      
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
      
      {/* Only show exit button on questionnaire and privacy screens */}
      {(step === 'mother-questionnaire' || step === 'mother-privacy') && exitButton}
      
      {/* Only show LanguageSelector when not in questionnaire or privacy screens */}
      {step !== 'mother-questionnaire' && step !== 'mother-privacy' && <LanguageSelector />}
    </main>
  );
};

export default PersonalityTest; 