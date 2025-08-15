#!/usr/bin/env python3
"""
Generate sample CSV files for testing the raffle spinner with various sizes
"""

import csv
import random
from pathlib import Path

# Common first names
first_names = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Lisa", "Daniel", "Nancy",
    "Matthew", "Betty", "Anthony", "Helen", "Mark", "Sandra", "Donald", "Donna",
    "Steven", "Carol", "Kenneth", "Ruth", "Andrew", "Sharon", "Joshua", "Michelle",
    "Kevin", "Laura", "Brian", "Emily", "George", "Kimberly", "Timothy", "Deborah",
    "Ronald", "Dorothy", "Edward", "Amy", "Jason", "Angela", "Jeffrey", "Ashley"
]

# Common last names
last_names = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
    "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
    "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz"
]

def generate_participants(count, start_ticket=1):
    """Generate a list of participants with random names"""
    participants = []
    for i in range(count):
        first = random.choice(first_names)
        last = random.choice(last_names)
        ticket = str(start_ticket + i).zfill(len(str(start_ticket + count - 1)))
        participants.append({
            'first': first,
            'last': last,
            'ticket_number': ticket
        })
    return participants

def write_csv(filename, participants):
    """Write participants to a CSV file"""
    output_path = Path(__file__).parent / filename
    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['first', 'last', 'ticket_number'])
        writer.writeheader()
        writer.writerows(participants)
    print(f"✅ Generated {filename}: {len(participants):,} entries")

def main():
    """Generate various sized CSV files"""
    
    # 5,000 entries (tickets 10001-15000)
    participants_5k = generate_participants(5000, 10001)
    write_csv('raffle-5k.csv', participants_5k)
    
    # 10,000 entries (tickets 20001-30000)
    participants_10k = generate_participants(10000, 20001)
    write_csv('raffle-10k.csv', participants_10k)
    
    # 25,000 entries (tickets 50001-75000)
    participants_25k = generate_participants(25000, 50001)
    write_csv('raffle-25k.csv', participants_25k)
    
    # 50,000 entries (tickets 100001-150000)
    participants_50k = generate_participants(50000, 100001)
    write_csv('raffle-50k.csv', participants_50k)
    
    # 100,000 entries (tickets 200001-300000)
    participants_100k = generate_participants(100000, 200001)
    write_csv('raffle-100k.csv', participants_100k)
    
    print("\n🎉 All sample CSV files generated successfully!")
    print("Files are located in: apps/spinner-extension/samples/")

if __name__ == "__main__":
    main()