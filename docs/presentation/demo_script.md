# CN6035 Theatre Reservation App — Demo Script

## Presentation Context

This script supports the PowerPoint presentation and live/video demonstration for the Theatre Reservation App.

The aim is to present the project as a complete three-tier mobile distributed system using:

- React Native / Expo frontend
- Node.js / Express REST API backend
- MariaDB database
- JWT authentication
- seat availability and double-booking prevention logic

Recommended total presentation time: up to 10 minutes.

---

# 0:00 – 0:40 — Introduction and Project Aim

## What to show

PowerPoint Slide 1: Title Slide  
PowerPoint Slide 2: Problem and Aim

## What to say

Καλησπέρα σας.

Η εργασία μου είναι η ανάπτυξη μιας εφαρμογής κράτησης θέσεων σε θεατρικές παραστάσεις μέσω κινητής εφαρμογής.

Η εφαρμογή επιτρέπει στον χρήστη να αναζητά παραστάσεις, να βλέπει διαθέσιμα showtimes, να επιλέγει συγκεκριμένες θέσεις και να διαχειρίζεται τις κρατήσεις του.

Ο βασικός στόχος δεν είναι μόνο η απλή αποθήκευση και διαχείριση κρατήσεων, αλλά η υλοποίηση ενός κατανεμημένου συστήματος τριών επιπέδων με React Native frontend, Node.js / Express backend και MariaDB database.

Ιδιαίτερη έμφαση δίνεται στην ασφάλεια μέσω JWT authentication, στη διαχείριση κρατήσεων και στην αποτροπή διπλοκράτησης θέσεων.

---

# 0:40 – 1:20 — Main Features

## What to show

PowerPoint Slide 3: Βασικές Λειτουργίες

## What to say

Οι βασικές λειτουργίες της εφαρμογής καλύπτουν όλη τη ροή ενός χρήστη.

Αρχικά, ο χρήστης μπορεί να κάνει εγγραφή και σύνδεση με JWT authentication. Στη συνέχεια μπορεί να δει διαθέσιμα θέατρα και παραστάσεις, να αναζητήσει παραστάσεις με βάση τίτλο, τοποθεσία, θέατρο ή ημερομηνία, και να ανοίξει τις λεπτομέρειες μιας παράστασης.

Μέσα από τις λεπτομέρειες, ο χρήστης βλέπει τα διαθέσιμα showtimes και μπορεί να προχωρήσει στην επιλογή συγκεκριμένων θέσεων. Η εφαρμογή δείχνει ποιες θέσεις είναι διαθέσιμες και ποιες όχι.

Τέλος, ο χρήστης μπορεί να δημιουργήσει κράτηση, να δει το ιστορικό κρατήσεών του και να τροποποιήσει ή να ακυρώσει μελλοντικές κρατήσεις.

Άρα η εφαρμογή καλύπτει πλήρη ροή χρήστη: αναζήτηση, επιλογή θέσεων, κράτηση και διαχείριση.

---

# 1:20 – 2:10 — System Architecture

## What to show

PowerPoint Slide 4: Αρχιτεκτονική Συστήματος

## What to say

# 1:20 – 2:10 — System Architecture

## What to show

PowerPoint Slide 4: Αρχιτεκτονική Συστήματος

## What to say

Η εφαρμογή ακολουθεί αρχιτεκτονική τριών επιπέδων.

Το πρώτο επίπεδο είναι το React Native / Expo mobile frontend, το οποίο προσφέρει τις οθόνες του χρήστη και επικοινωνεί με το backend μέσω HTTP REST requests.

Το δεύτερο επίπεδο είναι το Node.js / Express REST API. Εκεί βρίσκονται τα routes, controllers, services, middleware, validation, business logic και η λογική κρατήσεων.

Το τρίτο επίπεδο είναι η MariaDB database, όπου αποθηκεύονται οι χρήστες, τα θέατρα, οι παραστάσεις, τα showtimes, οι θέσεις και οι κρατήσεις.

Η επικοινωνία με protected endpoints γίνεται με JWT token στο Authorization header.

---

# 2:10 – 3:00 — Database Design and ERD

## What to show

PowerPoint Slide 5: Σχεδιασμός Βάσης Δεδομένων

## What to say

Η βάση δεδομένων σχεδιάστηκε με κανονικοποιημένη δομή και καθαρές σχέσεις μεταξύ των βασικών οντοτήτων της εφαρμογής.

Υπάρχουν πίνακες για users, theatres, halls, shows, showtimes, seat categories, seats, reservations και reservation_seats.

Ο πίνακας reservation_seats λειτουργεί ως ενδιάμεσος πίνακας που συνδέει κάθε κράτηση με τις συγκεκριμένες θέσεις που επέλεξε ο χρήστης.

Το πιο σημαντικό σημείο είναι ο μοναδικός περιορισμός UNIQUE(showtime_id, seat_id). Αυτό σημαίνει ότι η ίδια θέση δεν μπορεί να κρατηθεί δύο φορές για το ίδιο showtime.

Με αυτόν τον σχεδιασμό, η βάση δεδομένων δεν αποθηκεύει απλώς κρατήσεις, αλλά βοηθά ενεργά στη συνέπεια δεδομένων και στην αποτροπή διπλοκράτησης θέσεων.

---

# 3:00 – 3:40 — Authentication and JWT

## What to show

PowerPoint Slide 6: Ταυτοποίηση Χρήστη και JWT

## What to say

# 3:00 – 3:40 — Authentication and JWT

## What to show

PowerPoint Slide 6: Ταυτοποίηση Χρήστη και JWT

## What to say

Η εφαρμογή υποστηρίζει εγγραφή και σύνδεση χρήστη με email και password.

Τα passwords δεν αποθηκεύονται απευθείας στη βάση, αλλά γίνονται hashed με bcrypt.

Μετά από επιτυχημένο login, το backend επιστρέφει JWT token.

Το token χρησιμοποιείται από το frontend για να καλεί protected endpoints, όπως η δημιουργία κράτησης και η προβολή των κρατήσεων του χρήστη.

Επίσης, το backend ελέγχει ότι ο χρήστης μπορεί να βλέπει και να διαχειρίζεται μόνο τις δικές του κρατήσεις.

---

# 3:40 – 4:20 — Backend REST API

## What to show

PowerPoint Slide 7: Backend REST API

## What to say

# 3:40 – 4:20 — Backend REST API

## What to show

PowerPoint Slide 7: Backend REST API

## What to say

Το backend παρέχει REST API endpoints για όλες τις βασικές λειτουργίες.

Υπάρχουν endpoints για register και login, endpoints για προβολή θεάτρων, παραστάσεων, showtimes και θέσεων, καθώς και protected endpoints για δημιουργία, τροποποίηση, ακύρωση και προβολή κρατήσεων.

Η δομή του backend είναι χωρισμένη σε routes, controllers, services, middleware και database layer.

Αυτός ο διαχωρισμός βοηθάει ώστε ο κώδικας να είναι πιο καθαρός, επεκτάσιμος και ευκολότερος στη συντήρηση.

---

# 4:20 – 5:20 — Seat Availability and Reservation Logic

## What to show

PowerPoint Slide 8: Διαθεσιμότητα Θέσεων και Λογική Κράτησης

## What to say

Το πιο σημαντικό τεχνικό κομμάτι της εφαρμογής είναι η λογική διαθεσιμότητας θέσεων.

Οι διαθέσιμες θέσεις φορτώνονται ανά showtime. Όταν ο χρήστης επιλέγει θέσεις, το backend δεν εμπιστεύεται απλώς το frontend, αλλά ελέγχει ξανά ότι οι θέσεις ανήκουν στη σωστή αίθουσα και ότι δεν έχουν ήδη κρατηθεί.

Η δημιουργία και η τροποποίηση κράτησης γίνεται μέσα σε database transaction. Αν όλα τα βήματα πετύχουν, γίνεται commit. Αν υπάρξει σφάλμα, γίνεται rollback, ώστε να μη μείνει η βάση σε λάθος κατάσταση.

Επιπλέον, το UNIQUE(showtime_id, seat_id) λειτουργεί ως τελικό επίπεδο προστασίας στη βάση δεδομένων, ώστε η ίδια θέση να μην μπορεί να κρατηθεί δύο φορές για το ίδιο showtime.

Στις ακυρωμένες κρατήσεις, το reservation παραμένει στο ιστορικό, αλλά οι αντίστοιχες θέσεις απελευθερώνονται ώστε να μπορούν να κρατηθούν ξανά.

---

# 5:20 – 6:00 — Mobile UI Screenshots

## What to show

PowerPoint Slide 9: Οθόνες Εφαρμογής και Ροή Χρήστη

## What to say

# 5:20 – 6:00 — Mobile UI Screenshots

## What to show

PowerPoint Slide 9: Οθόνες Εφαρμογής και Ροή Χρήστη

## What to say

Εδώ φαίνεται η frontend ροή της εφαρμογής.

Στην οθόνη Seat Selection, ο χρήστης βλέπει διαθέσιμες, επιλεγμένες και μη διαθέσιμες θέσεις. Μετά τη δημιουργία κράτησης εμφανίζεται success feedback.

Στην οθόνη My Reservations, ο χρήστης μπορεί να δει τις ενεργές και τις ακυρωμένες κρατήσεις του.

Αυτό δείχνει ότι το frontend επικοινωνεί σωστά με το backend και παρέχει καθαρό feedback στον χρήστη.

---

# 6:00 – 6:40 — Testing Evidence

## What to show

PowerPoint Slide 10: Τεκμηρίωση Ελέγχων

## What to say

# 6:00 – 6:40 — Testing Evidence

## What to show

PowerPoint Slide 10: Τεκμηρίωση Ελέγχων

## What to say

Για τον τελικό έλεγχο έγινε backend regression testing.

Ελέγχθηκαν τα βασικά endpoints όπως health, database connection, register, login, protected routes, create reservation, edit reservation και cancel reservation.

Επιβεβαιώθηκε επίσης ότι η ίδια θέση δεν μπορεί να κρατηθεί δύο φορές για το ίδιο showtime.

Τέλος, ελέγχθηκε ότι όταν μια κράτηση ακυρώνεται, οι θέσεις απελευθερώνονται σωστά.

Το τελικό αποτέλεσμα ήταν ότι όλα τα backend regression tests πέρασαν επιτυχώς.


---

# 6:40 – 8:40 — Live Demo / Video Evidence

## What to show

PowerPoint Slide 11: Ροή Live Demo και Τεκμηρίωση Βίντεο  
Play the embedded demo video.

## What to say before playing the video

Στο demo video φαίνεται η πλήρης λειτουργική ροή της εφαρμογής.

Αρχικά, ο χρήστης συνδέεται στην εφαρμογή και βλέπει τις διαθέσιμες παραστάσεις που φορτώνονται από το backend. Στη συνέχεια γίνεται αναζήτηση παράστασης, άνοιγμα των λεπτομερειών, επιλογή showtime και επιλογή συγκεκριμένων διαθέσιμων θέσεων.

Μετά τη δημιουργία της κράτησης, η εφαρμογή εμφανίζει success feedback και η κράτηση εμφανίζεται στο My Reservations.

Στο demo φαίνεται επίσης η τροποποίηση κράτησης, η ακύρωση και η μεταφορά της κράτησης στο cancelled history.

Το σημαντικό σημείο είναι ότι η εφαρμογή δεν χρησιμοποιεί στατικά δεδομένα. Το frontend επικοινωνεί με το backend και η βάση δεδομένων ενημερώνεται σε κάθε βήμα της ροής.

## What to point out while the video plays

Κατά τη διάρκεια του βίντεο φαίνεται ότι η εφαρμογή δεν χρησιμοποιεί στατικά δεδομένα, αλλά επικοινωνεί με το backend.

Η επιλογή θέσεων ενημερώνει τη διαθεσιμότητα και η ακύρωση μεταφέρει την κράτηση στο cancelled history.

Αυτό αποδεικνύει την πλήρη σύνδεση frontend, backend και database.

---

# 8:40 – 9:40 — Conclusion and Future Improvements

## What to show

PowerPoint Slide 12: Συμπέρασμα και Μελλοντικές Βελτιώσεις

## What to say

# 8:40 – 9:40 — Conclusion and Future Improvements

## What to show

PowerPoint Slide 12: Συμπέρασμα και Μελλοντικές Βελτιώσεις

## What to say

Συμπερασματικά, υλοποιήθηκε μια πλήρης εφαρμογή κράτησης θέσεων για θεατρικές παραστάσεις.

Το σύστημα ακολουθεί αρχιτεκτονική τριών επιπέδων, με React Native frontend, Node.js / Express REST API και MariaDB database.

Η εφαρμογή υποστηρίζει JWT authentication, αναζήτηση παραστάσεων, επιλογή συγκεκριμένων θέσεων, δημιουργία, τροποποίηση και ακύρωση κρατήσεων.

Το πιο σημαντικό τεχνικό σημείο είναι η λογική διαθεσιμότητας θέσεων. Η χρήση database transactions και του UNIQUE(showtime_id, seat_id) ενισχύει τη συνέπεια δεδομένων και αποτρέπει τη διπλοκράτηση θέσεων.

Μελλοντικά, η εφαρμογή θα μπορούσε να επεκταθεί με online πληρωμές, QR εισιτήρια, admin dashboard, push notifications και πιο προχωρημένα φίλτρα αναζήτησης.

---

# 9:40 – 10:00 — Closing Statement

## What to say

Το project παρουσιάζει ένα ολοκληρωμένο κατανεμημένο σύστημα κρατήσεων μέσω κινητής εφαρμογής, με έμφαση στη λειτουργικότητα, την ασφάλεια και τη συνέπεια δεδομένων.

Ευχαριστώ πολύ.

