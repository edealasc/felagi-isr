from django.db import models

class Document(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    url = models.CharField(max_length=255, unique=True)
    post_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title

class Term(models.Model):
    word = models.CharField(max_length=255, unique=True)
    df = models.PositiveIntegerField(default=0)  # Document frequency

    def __str__(self):
        return self.word

class Posting(models.Model):
    term = models.ForeignKey(Term, related_name="postings", on_delete=models.CASCADE)
    document = models.ForeignKey(Document, related_name="postings", on_delete=models.CASCADE)
    tf_idf = models.FloatField()

    class Meta:
        unique_together = ('term', 'document')