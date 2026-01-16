"""
Management command to seed mock data for testing.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from profiles.models import MentorProfile, FounderProfile
from industries.models import IndustrySubcategory, Objective
from office_hours.models import AvailabilityRule
from connections.models import ConnectionRequest

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with mock mentors, founders, and availability'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing mock data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing mock data...')
            User.objects.filter(email__endswith='@mock.sapan.io').delete()

        # Get reference data
        industries = list(IndustrySubcategory.objects.all()[:5])
        objectives = list(Objective.objects.all()[:5])

        if not industries:
            self.stdout.write(self.style.ERROR(
                'No industries found. Run migrations and seed reference data first.'
            ))
            return

        # Mock Mentors
        mentors_data = [
            {
                'email': 'mentor1@mock.sapan.io',
                'first_name': 'Sarah',
                'last_name': 'Chen',
                'bio': 'Serial entrepreneur with 3 exits. Previously founder of TechStartup (acquired by Google). I love helping early-stage founders navigate fundraising and product-market fit.',
                'profile': {
                    'company': 'Google',
                    'role': 'Director of Product',
                    'years_of_experience': 15,
                }
            },
            {
                'email': 'mentor2@mock.sapan.io',
                'first_name': 'Michael',
                'last_name': 'Park',
                'bio': 'VC partner at Sequoia Capital. Previously engineering lead at Stripe. Passionate about fintech and developer tools.',
                'profile': {
                    'company': 'Sequoia Capital',
                    'role': 'Partner',
                    'years_of_experience': 12,
                }
            },
            {
                'email': 'mentor3@mock.sapan.io',
                'first_name': 'Lisa',
                'last_name': 'Wong',
                'bio': 'CMO at Grab. 20 years of marketing experience across SEA. Happy to help with go-to-market strategy and brand building.',
                'profile': {
                    'company': 'Grab',
                    'role': 'Chief Marketing Officer',
                    'years_of_experience': 20,
                }
            },
            {
                'email': 'mentor4@mock.sapan.io',
                'first_name': 'David',
                'last_name': 'Kumar',
                'bio': 'CTO at Agoda. Ex-Amazon. I can help with technical architecture, scaling systems, and building engineering teams.',
                'profile': {
                    'company': 'Agoda',
                    'role': 'CTO',
                    'years_of_experience': 18,
                }
            },
            {
                'email': 'mentor5@mock.sapan.io',
                'first_name': 'Anna',
                'last_name': 'Tanaka',
                'bio': 'Founder of HealthTech startup (Series B). Angel investor in 20+ startups. Focus on healthcare, biotech, and impact.',
                'profile': {
                    'company': 'HealthTech Ventures',
                    'role': 'Founder & CEO',
                    'years_of_experience': 10,
                }
            },
        ]

        # Availability patterns (weekday, start, end)
        availability_patterns = [
            [(0, '09:00', '12:00'), (2, '14:00', '17:00'), (4, '10:00', '12:00')],  # Mon, Wed, Fri
            [(1, '10:00', '13:00'), (3, '15:00', '18:00')],  # Tue, Thu
            [(0, '14:00', '17:00'), (3, '09:00', '12:00')],  # Mon afternoon, Thu morning
            [(2, '09:00', '11:00'), (4, '14:00', '16:00')],  # Wed, Fri
            [(1, '13:00', '16:00'), (4, '09:00', '12:00')],  # Tue, Fri
        ]

        self.stdout.write('Creating mentors...')
        for i, mentor_data in enumerate(mentors_data):
            username = mentor_data['email'].split('@')[0]
            user, created = User.objects.get_or_create(
                email=mentor_data['email'],
                defaults={
                    'username': username,
                    'first_name': mentor_data['first_name'],
                    'last_name': mentor_data['last_name'],
                    'user_type': 'mentor',
                    'bio': mentor_data['bio'],
                    'is_approved': True,
                    'is_profile_complete': True,
                }
            )

            if created:
                user.set_password('mockpassword123')
                user.save()

                # Create mentor profile
                profile = MentorProfile.objects.create(
                    user=user,
                    company=mentor_data['profile']['company'],
                    role=mentor_data['profile']['role'],
                    years_of_experience=mentor_data['profile']['years_of_experience'],
                )
                # Add industries and objectives
                profile.expertise_industries.set(industries[:3])
                profile.can_help_with.set(objectives[:3])

                # Create availability rules
                for weekday, start, end in availability_patterns[i]:
                    AvailabilityRule.objects.create(
                        mentor=user,
                        weekday=weekday,
                        start_time=start,
                        end_time=end,
                        slot_duration_minutes=30,
                        is_active=True,
                    )

                self.stdout.write(f'  Created mentor: {user.email}')
            else:
                self.stdout.write(f'  Skipped (exists): {user.email}')

        # Mock Founders
        founders_data = [
            {
                'email': 'founder1@mock.sapan.io',
                'first_name': 'Tom',
                'last_name': 'Wilson',
                'bio': 'Building the future of sustainable agriculture in Southeast Asia.',
                'profile': {
                    'startup_name': 'AgriTech Solutions',
                    'stage': 'seed',
                    'about_startup': 'We help farmers optimize crop yields using AI and IoT sensors.',
                }
            },
            {
                'email': 'founder2@mock.sapan.io',
                'first_name': 'Maya',
                'last_name': 'Patel',
                'bio': 'Fintech enthusiast. Making financial services accessible to underbanked populations.',
                'profile': {
                    'startup_name': 'PayEasy',
                    'stage': 'pre_seed',
                    'about_startup': 'Mobile-first payment platform for informal economies.',
                }
            },
            {
                'email': 'founder3@mock.sapan.io',
                'first_name': 'James',
                'last_name': 'Lee',
                'bio': 'Second-time founder. Previously sold my e-commerce startup. Now in edtech.',
                'profile': {
                    'startup_name': 'LearnSpace',
                    'stage': 'series_a',
                    'about_startup': 'Personalized learning platform for K-12 students.',
                }
            },
        ]

        self.stdout.write('\nCreating founders...')
        for founder_data in founders_data:
            username = founder_data['email'].split('@')[0]
            user, created = User.objects.get_or_create(
                email=founder_data['email'],
                defaults={
                    'username': username,
                    'first_name': founder_data['first_name'],
                    'last_name': founder_data['last_name'],
                    'user_type': 'founder',
                    'bio': founder_data['bio'],
                    'is_approved': True,
                    'is_profile_complete': True,
                }
            )

            if created:
                user.set_password('mockpassword123')
                user.save()

                # Create founder profile
                profile = FounderProfile.objects.create(
                    user=user,
                    startup_name=founder_data['profile']['startup_name'],
                    industry=industries[0] if industries else None,
                    stage=founder_data['profile']['stage'],
                    about_startup=founder_data['profile']['about_startup'],
                )
                profile.objectives.set(objectives[:2])

                self.stdout.write(f'  Created founder: {user.email}')
            else:
                self.stdout.write(f'  Skipped (exists): {user.email}')

        # Create connections between founders and mentors
        self.stdout.write('\nCreating connections...')
        mentors = User.objects.filter(email__startswith='mentor', email__endswith='@mock.sapan.io')
        founders = User.objects.filter(email__startswith='founder', email__endswith='@mock.sapan.io')

        for founder in founders:
            for mentor in mentors[:3]:  # Connect each founder to first 3 mentors
                conn, created = ConnectionRequest.objects.get_or_create(
                    from_user=founder,
                    to_user=mentor,
                    defaults={
                        'status': 'accepted',
                        'intent': 'mentor_me',
                        'message': 'Mock connection for testing',
                    }
                )
                if created:
                    self.stdout.write(f'  Connected {founder.email} <-> {mentor.email}')

        self.stdout.write(self.style.SUCCESS('\nDone! Mock data created.'))
        self.stdout.write('\nTest accounts (password: mockpassword123):')
        self.stdout.write('  Mentors: mentor1@mock.sapan.io through mentor5@mock.sapan.io')
        self.stdout.write('  Founders: founder1@mock.sapan.io through founder3@mock.sapan.io')
        self.stdout.write('\nConnections: Each founder is connected to mentors 1-3')
