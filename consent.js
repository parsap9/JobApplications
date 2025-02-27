// Content script for job application autofill functionality

// CV data imported from cv.json
const cvData = {
  "personalInfo": {
    "name": "Parsa Taba",
    "location": "Australia", 
    "phone": "+61 433 816 216",
    "email": "PARSA.TABATABAEII@YAHOO.COM"
  },
  "professionalSummary": "Results-driven Project Management & Strategy Professional with 5+ years of experience in data analytics, business operations, and strategic growth across healthcare, legal tech, and hospitality. Adept at leveraging data insights to optimize workflows, enhance operational performance, and drive business growth. Proficient in Python, SQL, Tableau, Power BI, and project management tools such as Jira and Salesforce. Currently pursuing a Master's in Applied Data Science to deepen expertise in data-driven decision-making and strategic problem-solving.",
  "employmentHistory": [
    {
      "title": "Practice Manager",
      "company": "Partnered Health",
      "location": "Canberra",
      "period": {
        "start": "Jan 2024",
        "end": "Present"
      },
      "responsibilities": [
        "Leading the operational management of a busy healthcare practice",
        "Analyzing patient data to improve service delivery and operational efficiency", 
        "Implementing process improvements and overseeing practice workflows",
        "Managing staff rosters, recruitment, and development",
        "Coordinating with external stakeholders to optimize clinic operations"
      ]
    },
    {
      "title": "Business Development Representative",
      "company": "Avvoka",
      "location": "London",
      "period": {
        "start": "Mar 2023",
        "end": "Mar 2024"
      },
      "responsibilities": [
        "Led market research and data-driven expansion strategies for a legal technology platform",
        "Conducted market research and competitor analysis",
        "Assisted with onboarding top AMLAW100 and UK200 law firms",
        "Developed strategies to expand into new markets and industry verticals",
        "Delivered high-impact product demonstrations and strategic sales pitches"
      ]
    },
    {
      "title": "Co-Owner",
      "company": "5th Avenue Bar/Nightclub",
      "location": "Canberra",
      "period": {
        "start": "Jul 2021",
        "end": "Dec 2022"
      },
      "responsibilities": [
        "Founded and led strategic planning for a high-performing hospitality business",
        "Drove $1M+ revenue in the first year by optimizing operational efficiency and marketing",
        "Leveraged data insights to optimize stock management and customer experience"
      ]
    },
    {
      "title": "Real Estate Sales Associate", 
      "company": "HIVE Property",
      "location": "Canberra",
      "period": {
        "start": "May 2022",
        "end": "Nov 2022"
      },
      "responsibilities": [
        "Conducted market analysis and property valuation modeling to support real estate transactions",
        "Assisted in $20M+ worth of property deals, leveraging data-driven investment insights",
        "Developed feasibility studies and financial models for builders and developers"
      ]
    },
    {
      "title": "Advertising Consultant",
      "company": "Australian Community Media",
      "period": {
        "start": "Dec 2019",
        "end": "May 2022"
      },
      "responsibilities": [
        "Managed advertising projects for 150+ businesses, optimizing marketing strategies with data",
        "Led data-driven sales forecasting and performance tracking for regional campaigns",
        "Collaborated with design and editorial teams to align branding and sales strategies"
      ]
    }
  ],
  "education": [
    {
      "degree": "Master of Applied Data Science",
      "institution": "Monash University",
      "expectedCompletion": "Dec 2025"
    },
    {
      "degree": "Bachelor of Medical Science",
      "institution": "Australian National University", 
      "completionDate": "Jan 2024"
    }
  ],
  "certifications": [
    {
      "name": "CAPM (Certified Associate in Project Management)",
      "institution": "Project Management Institute (PMI)",
      "period": "2023 - 2028"
    }
  ],
  "skills": {
    "technical": [
      "Python",
      "R",
      "SQL",
      "Tableau", 
      "Power BI",
      "Salesforce",
      "Jira",
      "HubSpot",
      "Microsoft Office",
      "Xero"
    ],
    "professional": [
      "Data Analysis",
      "Project Management", 
      "Business Development",
      "Market Research",
      "Event Planning",
      "Real Estate"
    ]
  },
  "accomplishments": [
    "Named as one of the top 10 young Australian Entrepreneurs making a difference in 2023 byAuspreneur",
    "Completed the Canberra marathon (42.2 km) in 5 hours and 11 minutes",
    "Canteen Australia Bronze Award for assisting 75+ children affected by cancer",
    "Founded and operated a hospitality business at age 20, generating over $1 million AUD in its first year"
  ]
};

// Common field identifiers
const FIELD_MAPPINGS = {
    name: ['name', 'full-name', 'fullname'],
    email: ['email', 'e-mail'],
    phone: ['phone', 'telephone', 'mobile'],
    location: ['location', 'address', 'city'],
    experience: ['experience', 'work-experience', 'employment']
};

// Initialize autofill functionality
function initializeAutofill() {
    // Create floating edit button
    const editButton = createEditButton();
    document.body.appendChild(editButton);

    // Find and fill form fields
    const inputFields = document.querySelectorAll('input, textarea');
    inputFields.forEach(field => {
        const matchedField = identifyField(field);
        if (matchedField) {
            fillField(field, matchedField);
            highlightField(field);
        }
    });

    // Extract job description
    const jobDescription = extractJobDescription();
    if (jobDescription) {
        // Send to background script for analysis
        chrome.runtime.sendMessage({
            type: 'ANALYZE_JOB',
            description: jobDescription
        });
    }
}

// Create floating edit button
function createEditButton() {
    const button = document.createElement('button');
    button.innerHTML = 'Edit Autofill';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '10000';
    button.addEventListener('click', enableFieldEditing);
    return button;
}

// Identify field type based on attributes and context
function identifyField(field) {
    const attributes = [
        field.id?.toLowerCase(),
        field.name?.toLowerCase(),
        field.placeholder?.toLowerCase(),
        field.getAttribute('aria-label')?.toLowerCase()
    ];

    for (const [fieldType, identifiers] of Object.entries(FIELD_MAPPINGS)) {
        if (identifiers.some(id => attributes.some(attr => attr?.includes(id)))) {
            return fieldType;
        }
    }
    return null;
}

// Fill field with CV data
function fillField(field, fieldType) {
    let value = '';
    switch (fieldType) {
        case 'name':
            value = cvData.personalInfo.name;
            break;
        case 'email':
            value = cvData.personalInfo.email;
            break;
        case 'phone':
            value = cvData.personalInfo.phone;
            break;
        case 'location':
            value = cvData.personalInfo.location;
            break;
        case 'experience':
            value = cvData.employmentHistory
                .map(job => `${job.title} at ${job.company} (${job.period.start} - ${job.period.end})`)
                .join('\n');
            break;
    }
    field.value = value;
}

// Highlight filled fields
function highlightField(field) {
    field.style.backgroundColor = '#f0f9ff';
    field.style.border = '2px solid #3b82f6';
}

// Enable editing of filled fields
function enableFieldEditing() {
    const filledFields = document.querySelectorAll('input[style*="background-color"], textarea[style*="background-color"]');
    filledFields.forEach(field => {
        field.style.backgroundColor = '#fff';
        field.style.border = '2px solid #22c55e';
        field.readOnly = false;
    });
}

// Extract job description from common locations
function extractJobDescription() {
    const possibleSelectors = [
        '.job-description',
        '#job-description',
        '[data-test="job-description"]',
        '.description',
        '.posting-description'
    ];

    for (const selector of possibleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    return null;
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeAutofill);

// Handle dynamic content loading
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            initializeAutofill();
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
