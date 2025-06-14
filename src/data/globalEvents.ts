import { Event } from "@/types/events";

export const globalEvents: Event[] = [
  {
    id: 'covid-start',
    title: 'COVID-19 Pandemic',
    date: new Date('2020-03-11'),
    type: 'global',
    description: 'WHO declares COVID-19 a pandemic',
    color: '#EF4444'
  },
  {
    id: 'bitcoin-2017',
    title: 'Bitcoin Peak',
    date: new Date('2017-12-17'),
    type: 'global',
    description: 'Bitcoin reaches $20,000 for the first time',
    color: '#F59E0B'
  },
  {
    id: 'ai-chatgpt',
    title: 'ChatGPT Launch',
    date: new Date('2022-11-30'),
    type: 'global',
    description: 'OpenAI releases ChatGPT',
    color: '#10B981'
  },
  {
    id: 'iphone-release',
    title: 'First iPhone',
    date: new Date('2007-06-29'),
    type: 'global',
    description: 'First iPhone released',
    color: '#3B82F6'
  },
  {
    id: 'y2k',
    title: 'Y2K',
    date: new Date('2000-01-01'),
    type: 'global',
    description: 'The year 2000 problem',
    color: '#8B5CF6'
  }
];
