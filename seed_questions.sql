-- SEED DATA FOR ACE IT UP 2026
-- Run this in Supabase SQL Editor

-- 1. APTITUDE QUESTIONS (Sample)
INSERT INTO public.module_questions (module_type, category, question_text, options, correct_answer, difficulty, explanation)
VALUES 
('aptitude', 'Quants', 'If direct labor is $25,000 and direct materials are $35,000 and manufacturing overhead is $10,000, what is the prime cost?', '["$60,000", "$70,000", "$35,000", "$45,000"]', '0', 'Intermediate', 'Prime Cost = Direct Materials + Direct Labor = $35,000 + $25,000 = $60,000.'),
('aptitude', 'Logical', 'Pointing to a photograph, a woman says, "This man''s son''s sister is my mother-in-law." How is the woman''s husband related to the man in the photograph?', '["Grandson", "Son", "Nephew", "Son-in-law"]', '0', 'Expert', 'The woman''s mother-in-law is the sister of the man''s son. This means she is the man''s daughter. So, the man is her husband''s maternal grandfather. Thus, the husband is the man''s grandson.'),
('aptitude', 'Verbal', 'Choose the word that is most nearly OPPOSITE in meaning to: EPHEMERAL', '["Eternal", "Short", "Frail", "Transient"]', '0', 'Intermediate', 'Ephemeral means short-lived. Eternal means lasting forever.'),
('aptitude', 'Quants', 'The average of 7 consecutive numbers is 20. The largest of these numbers is:', '["20", "22", "23", "24"]', '2', 'Beginner', 'Let the numbers be x-3, x-2, x-1, x, x+1, x+2, x+3. Average = x = 20. Largest = x+3 = 23.'),

-- 2. INTERVIEW QUESTIONS
('interview', 'Behavioral', 'Tell me about a time you failed and how you handled it.', '[]', '0', 'Intermediate', 'Focus on the "Result" and "Learning" phase of the STAR method.'),
('interview', 'Technical', 'What is the difference between a Process and a Thread?', '[]', '0', 'Intermediate', 'Process is an independent program execution; Thread is a subset of a process sharing the same memory.'),

-- 3. COMMUNICATION PROMPTS
('communication', 'Speech', 'Should AI replace human managers?', '[]', '0', 'Expert', 'Consider ethical oversight, data-driven decisions vs empathy.'),
('communication', 'Intro', 'Introduce yourself in a way that highlights your adaptability.', '[]', '0', 'Beginner', 'Focus on a specific instance where you pivot successfully.'),

-- 4. GD TOPICS
('gd', 'Current Affairs', 'The Impact of Social Media on Modern Democracy', '[]', '0', 'Intermediate', 'Discuss echo chambers, misinformation, and global connectivity.');
