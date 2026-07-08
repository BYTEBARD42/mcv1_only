import json
import pandas as pd

df = pd.read_csv(r'backend\vaccine_data.csv')
with open(r'frontend\public\data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

demo_trends = {}
countries = data.get('countries', ['Kyrgyzstan', 'Lesotho', 'Uzbekistan'])

for c in countries:
    c_df = df[df['Country'] == c].sort_values('Year')
    trends = []
    for _, row in c_df.iterrows():
        trends.append({
            'year': int(row['Year']),
            'pop': float(row['Total Population, as of 1 July (thousands)']) * 1000,
            'births': float(row['Births (thousands)']) * 1000,
            'br': float(row['Crude Birth Rate (births per 1,000 population)']),
            'imr': float(row['Infant Mortality Rate (infant deaths per 1,000 live births)']),
            'u5': float(row['Under-Five Mortality (deaths under age 5 per 1,000 live births)']),
            'mig': float(row['Net Number of Migrants (thousands)']) * 1000
        })
    demo_trends[c] = trends

data['demographicTrends'] = demo_trends

with open(r'frontend\public\data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Added demographicTrends to data.json")
